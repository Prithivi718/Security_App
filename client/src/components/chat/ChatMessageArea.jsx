import React, { useEffect, useRef } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatMessageArea = () => {
    const { user: currentUser } = useAuth();
    const { messages, isLoadingMessages, messagesError, activeConversation } = useChat();
    const messagesEndRef = useRef(null);
    const prevLengthRef = useRef(0);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        // Only scroll down if message list actually grows (new message received or sent)
        if (messages.length > prevLengthRef.current) {
            scrollToBottom("smooth");
        }
        prevLengthRef.current = messages.length;
    }, [messages.length]);

    if (isLoadingMessages) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xs text-[#777777] font-mono">
                Decrypting messages...
            </div>
        );
    }

    if (messagesError) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xs text-[#CC0000] font-mono">
                {messagesError}
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#F9F9F9]">
            {/* System notice at top */}
            <div className="flex justify-center my-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EAEAEA] border border-[#D4D4D4] rounded-full text-[10px] text-[#555555] font-mono">
                    <Lock size={10} />
                    <span>Messages are end-to-end encrypted with AES-256-GCM. Plaintext is never stored on disk.</span>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-48 text-center text-xs text-[#888888] font-sans">
                    No messages yet. Send a message to start the secure conversation.
                </div>
            ) : (
                messages.map((msg) => {
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const isOutgoing = msg.senderId?.toString() === currentUserId?.toString() || msg.senderId?._id?.toString() === currentUserId?.toString();

                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col max-w-[70%] ${isOutgoing ? "ml-auto items-end" : "mr-auto items-start"
                                }`}
                        >
                            {/* Message Bubble */}
                            <div
                                className={`px-3.5 py-2 rounded-lg text-xs leading-relaxed font-sans shadow-sm break-words ${isOutgoing
                                    ? "bg-[#111111] text-[#FFFFFF] rounded-br-none"
                                    : "bg-[#FFFFFF] text-[#111111] border border-[#D4D4D4] rounded-bl-none"
                                    }`}
                            >
                                {msg.decryptionError ? (
                                    <div className="flex items-center gap-1.5 text-[#FF4D4D] font-mono text-[11px]">
                                        <ShieldAlert size={12} />
                                        <span>[Decryption Failed]</span>
                                    </div>
                                ) : (
                                    <span>{msg.plaintext}</span>
                                )}
                            </div>

                            {/* Timestamp */}
                            <span className="text-[10px] text-[#888888] font-mono mt-0.5 px-0.5">
                                {formatTime(msg.createdAt)}
                            </span>
                        </div>
                    );
                })
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessageArea;
