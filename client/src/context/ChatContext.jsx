import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import messageService from "../services/message.service.js";
import chatSessionService from "../services/chatSession.service.js";
import friendshipService from "../services/friendship.service.js";
import { hasConversationKey, clearConversationKey } from "../services/crypto/key.service.js";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    // Contacts: { friends: [], groups: [] }
    const [contacts, setContacts] = useState({ friends: [], groups: [] });
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [contactsError, setContactsError] = useState(null);

    // Active conversation: null or { type: 'friendship'|'group', id, name, user, raw }
    const [activeConversation, setActiveConversation] = useState(null);

    // Map of active session info per conversation: { [conversationId]: { sessionId, expiresAt, remainingSeconds } }
    const [activeSessions, setActiveSessions] = useState({});

    // Decrypted messages stream for current active conversation
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messagesError, setMessagesError] = useState(null);

    // Ref to track activeSessions without causing stale interval closures
    const activeSessionsRef = useRef(activeSessions);
    useEffect(() => {
        activeSessionsRef.current = activeSessions;
    }, [activeSessions]);

    /**
     * Compute conversation key string: `friendship:<id>` or `group:<id>`
     */
    const getConversationId = useCallback((conv) => {
        if (!conv) return null;
        return `${conv.type}:${conv.id}`;
    }, []);

    /**
     * Fetch all friends and group contacts
     */
    const fetchContacts = useCallback(async () => {
        try {
            setIsLoadingContacts(true);
            setContactsError(null);
            const data = await messageService.getChatContacts();
            setContacts({
                friends: data.friends || [],
                groups: data.groups || []
            });
        } catch (err) {
            setContactsError(err.message || "Failed to load chat contacts");
        } finally {
            setIsLoadingContacts(false);
        }
    }, []);

    // Initial contacts load
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    /**
     * Fetch and decrypt messages for a specified conversation if key is active
     */
    const fetchMessages = useCallback(async (conv = activeConversation) => {
        if (!conv) {
            setMessages([]);
            return;
        }

        const convId = `${conv.type}:${conv.id}`;
        if (!hasConversationKey(convId)) {
            setMessages([]);
            return;
        }

        try {
            setIsLoadingMessages(true);
            setMessagesError(null);

            const params = conv.type === "friendship"
                ? { friendshipId: conv.id }
                : { groupId: conv.id };

            const data = await messageService.getMessages(params);
            const msgList = Array.isArray(data) ? data : (data.messages || []);
            // Backend returns sorted by createdAt desc; reverse for chat display (oldest to newest)
            setMessages([...msgList].reverse());
        } catch (err) {
            setMessagesError(err.message || "Failed to load messages");
            setMessages([]);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [activeConversation]);

    /**
     * Ticker loop: update session remaining seconds every 1 second
     */
    useEffect(() => {
        const interval = setInterval(() => {
            const currentSessions = activeSessionsRef.current;
            const updated = { ...currentSessions };
            let changed = false;

            const now = Date.now();

            for (const [convId, sessionData] of Object.entries(currentSessions)) {
                if (!sessionData) continue;

                const expiresAtMs = new Date(sessionData.expiresAt).getTime();
                const remaining = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

                if (remaining <= 0) {
                    // Session expired! Purge volatile memory & revoke
                    clearConversationKey(convId);
                    if (sessionData.sessionId) {
                        chatSessionService.revokeChatSession(sessionData.sessionId, convId).catch(() => { });
                    }
                    delete updated[convId];
                    changed = true;
                } else if (sessionData.remainingSeconds !== remaining) {
                    updated[convId] = { ...sessionData, remainingSeconds: remaining };
                    changed = true;
                }
            }

            if (changed) {
                setActiveSessions(updated);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Select a conversation
     */
    const selectConversation = useCallback((conv) => {
        setActiveConversation(conv);
        setMessages([]);
        setMessagesError(null);

        if (conv) {
            const convId = `${conv.type}:${conv.id}`;
            if (hasConversationKey(convId)) {
                fetchMessages(conv);
            }
        }
    }, [fetchMessages]);

    /**
     * Unlock current conversation chat session
     */
    const unlockCurrentChat = async (secretCode) => {
        if (!activeConversation || !secretCode) {
            throw new Error("Secret code is required");
        }

        const { type, id } = activeConversation;
        const convId = `${type}:${id}`;

        let sessionResult;
        if (type === "friendship") {
            sessionResult = await chatSessionService.unlockFriendshipChat(id, secretCode);
        } else {
            sessionResult = await chatSessionService.unlockGroupChat(id, secretCode);
        }

        const expiresAtMs = new Date(sessionResult.expiresAt).getTime();
        const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));

        setActiveSessions(prev => ({
            ...prev,
            [convId]: {
                sessionId: sessionResult.sessionId,
                expiresAt: sessionResult.expiresAt,
                remainingSeconds
            }
        }));

        // Load messages after unlock
        await fetchMessages(activeConversation);
        return sessionResult;
    };

    /**
     * Lock/revoke current or specified conversation session
     */
    const lockConversation = async (convId = getConversationId(activeConversation)) => {
        if (!convId) return;

        const sessionData = activeSessions[convId];
        clearConversationKey(convId);

        if (sessionData?.sessionId) {
            try {
                await chatSessionService.revokeChatSession(sessionData.sessionId, convId);
            } catch (err) {
                // Ignore API error on revoke if already expired
            }
        }

        setActiveSessions(prev => {
            const next = { ...prev };
            delete next[convId];
            return next;
        });

        if (getConversationId(activeConversation) === convId) {
            setMessages([]);
        }
    };

    /**
     * Establish shared secret for a friendship
     */
    const establishSecret = async (friendshipId, secretCode) => {
        await friendshipService.setSharedSecret(friendshipId, secretCode);
        await fetchContacts();
    };

    /**
     * Send encrypted message in active conversation
     */
    const sendChatMessage = async (messageText) => {
        if (!activeConversation) {
            throw new Error("No active conversation selected");
        }

        const params = activeConversation.type === "friendship"
            ? { friendshipId: activeConversation.id, messageText }
            : { groupId: activeConversation.id, messageText };

        const response = await messageService.sendMessage(params);

        // Re-fetch messages to include new message
        await fetchMessages(activeConversation);
        return response;
    };

    const currentConvId = getConversationId(activeConversation);
    const isCurrentUnlocked = Boolean(currentConvId && hasConversationKey(currentConvId) && activeSessions[currentConvId]);
    const currentSession = currentConvId ? activeSessions[currentConvId] : null;

    return (
        <ChatContext.Provider
            value={{
                contacts,
                isLoadingContacts,
                contactsError,
                fetchContacts,
                activeConversation,
                selectConversation,
                activeSessions,
                currentSession,
                isCurrentUnlocked,
                unlockCurrentChat,
                lockConversation,
                establishSecret,
                messages,
                isLoadingMessages,
                messagesError,
                fetchMessages,
                sendChatMessage
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

export default ChatContext;
