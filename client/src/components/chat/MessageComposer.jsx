import React, { useState } from "react";
import { Send, Paperclip, Lock } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

const MessageComposer = () => {
    const { isCurrentUnlocked, sendChatMessage } = useChat();
    const [messageText, setMessageText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const trimmed = messageText.trim();
        if (!trimmed || !isCurrentUnlocked || isSending) return;

        try {
            setIsSending(true);
            setError(null);
            await sendChatMessage(trimmed);
            setMessageText("");
        } catch (err) {
            setError(err.message || "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-3 bg-[#FFFFFF] border-t border-[#D4D4D4] flex flex-col gap-1.5">
            {error && (
                <div className="text-[11px] text-[#CC0000] font-mono px-1">
                    {error}
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Attachment Icon Placeholder */}
                <button
                    type="button"
                    disabled={!isCurrentUnlocked}
                    className="p-2 text-[#777777] hover:text-[#111111] hover:bg-[#F0F0F0] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Attach file (not configured)"
                >
                    <Paperclip size={18} />
                </button>

                {/* Input box */}
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isCurrentUnlocked
                            ? "Write an encrypted message..."
                            : "Unlock conversation to send messages"
                    }
                    disabled={!isCurrentUnlocked || isSending}
                    className="flex-1 px-3 py-2 bg-[#F4F4F4] border border-[#D4D4D4] rounded text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] disabled:opacity-50 disabled:bg-[#EAEAEA] font-sans transition-colors"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!isCurrentUnlocked || !messageText.trim() || isSending}
                    className="px-3.5 py-2 bg-[#111111] text-[#FFFFFF] font-semibold text-xs rounded hover:bg-[#333333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shrink-0"
                >
                    {isSending ? (
                        <span className="font-mono text-[11px]">Encrypting...</span>
                    ) : (
                        <>
                            <span>Send</span>
                            <Send size={13} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageComposer;
