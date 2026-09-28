import api from "./api.js";
import { deriveSessionKey } from "./crypto/hkdf.service.js";
import { openConversationKey, clearConversationKey } from "./crypto/key.service.js";

/**
 * Chat Session Service - Handles API session unlock, Web Crypto HKDF key derivation, and session lifecycle
 */

/**
 * Unlocks a friendship chat by authenticating the secretCode with the backend,
 * deriving the local AES-256-GCM key using the returned kdf.salt & kdf.info via Web Crypto API,
 * and caching the CryptoKey in volatile memory.
 * 
 * @param {string} friendshipId
 * @param {string} secretCode
 */
export const unlockFriendshipChat = async (friendshipId, secretCode) => {
    if (!friendshipId || !secretCode) {
        throw new Error("Friendship ID and secret code are required to unlock chat");
    }

    const response = await api.post(`/chat-session/member/${friendshipId}/unlock`, { secretCode });

    const { session, kdf, keyVersion = 1 } = response;

    if (!kdf || !kdf.salt) {
        throw new Error("Backend did not return expected KDF salt configuration");
    }

    // Derive 256-bit AES-256-GCM session CryptoKey locally using Web Crypto API
    const sessionKey = await deriveSessionKey({
        sharedSecret: secretCode,
        kdfSalt: kdf.salt,
        info: kdf.info || "SecureNet/chat/v1",
        keyVersion
    });

    // Store key in volatile runtime memory only
    const conversationId = `friendship:${friendshipId}`;
    openConversationKey(conversationId, sessionKey);

    return {
        sessionId: session.sessionId,
        friendshipId: session.friendshipId,
        status: session.status,
        expiresAt: session.expiresAt,
        conversationId
    };
};

/**
 * Unlocks a group chat by authenticating the secretCode with the backend,
 * deriving the local AES-256-GCM key using the returned kdf.salt & kdf.info via Web Crypto API,
 * and caching the CryptoKey in volatile memory.
 * 
 * @param {string} groupId
 * @param {string} secretCode
 */
export const unlockGroupChat = async (groupId, secretCode) => {
    if (!groupId || !secretCode) {
        throw new Error("Group ID and secret code are required to unlock group chat");
    }

    const response = await api.post(`/chat-session/group/${groupId}/unlock`, { secretCode });

    const { session, kdf, keyVersion = 1 } = response;

    if (!kdf || !kdf.salt) {
        throw new Error("Backend did not return expected KDF salt configuration");
    }

    // Derive 256-bit AES-256-GCM session CryptoKey locally using Web Crypto API
    const sessionKey = await deriveSessionKey({
        sharedSecret: secretCode,
        kdfSalt: kdf.salt,
        info: kdf.info || "SecureNet/chat/v1",
        keyVersion
    });

    // Store key in volatile runtime memory only
    const conversationId = `group:${groupId}`;
    openConversationKey(conversationId, sessionKey);

    return {
        sessionId: session.sessionId,
        groupId: session.groupId,
        status: session.status,
        expiresAt: session.expiresAt,
        conversationId
    };
};

/**
 * Validates an active ChatSession with the backend
 * 
 * @param {string} sessionId
 */
export const validateChatSession = async (sessionId) => {
    if (!sessionId) {
        throw new Error("Session ID is required");
    }
    return api.get(`/chat-session/${sessionId}/validate`);
};

/**
 * Revokes an active ChatSession and purges the associated key from volatile memory
 * 
 * @param {string} sessionId
 * @param {string} [conversationId=null] e.g. "friendship:<id>" or "group:<id>"
 */
export const revokeChatSession = async (sessionId, conversationId = null) => {
    if (!sessionId) {
        throw new Error("Session ID is required");
    }

    const response = await api.delete(`/chat-session/${sessionId}`);

    if (conversationId) {
        clearConversationKey(conversationId);
    }

    return response;
};

export default {
    unlockFriendshipChat,
    unlockGroupChat,
    validateChatSession,
    revokeChatSession
};
