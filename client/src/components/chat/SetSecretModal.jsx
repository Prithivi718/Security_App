import React, { useState } from "react";
import { Key, Eye, EyeOff, X, ShieldCheck } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

const SetSecretModal = ({ conversation, onClose }) => {
    const { establishSecret } = useChat();

    const [secretCode, setSecretCode] = useState("");
    const [confirmSecret, setConfirmSecret] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!conversation) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!secretCode) {
            setError("Shared secret code is required");
            return;
        }

        if (secretCode !== confirmSecret) {
            setError("Secret codes do not match");
            return;
        }

        if (secretCode.length < 4) {
            setError("Secret code must be at least 4 characters long");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await establishSecret(conversation.id, secretCode);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to establish shared secret");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#111111] text-[#FFFFFF] border border-[#333333] rounded-lg shadow-2xl p-6 relative flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#777777] hover:text-[#FFFFFF] transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="w-10 h-10 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center text-[#FFFFFF] mb-3">
                    <Key size={18} />
                </div>

                <h3 className="text-sm font-semibold text-[#FFFFFF] tracking-tight font-sans">
                    Establish Shared Secret
                </h3>
                <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed font-sans">
                    Set a secret code for your friendship with <span className="font-semibold text-[#FFFFFF]">{conversation.name}</span>. Both participants must enter this exact secret code to unlock chats.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type={showSecret ? "text" : "password"}
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Enter shared secret..."
                            disabled={isLoading}
                            className="w-full px-3 py-2 pr-10 bg-[#1A1A1A] border border-[#333333] rounded text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#666666] font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#FFFFFF] p-0.5"
                        >
                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>

                    <input
                        type={showSecret ? "text" : "password"}
                        value={confirmSecret}
                        onChange={(e) => setConfirmSecret(e.target.value)}
                        placeholder="Confirm shared secret..."
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#666666] font-mono"
                    />

                    {error && (
                        <div className="text-[11px] text-[#FF4D4D] bg-[#2A1515] border border-[#552222] p-2 rounded font-mono">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-1.5 bg-[#222222] text-[#CCCCCC] text-xs font-medium rounded hover:bg-[#333333]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !secretCode || !confirmSecret}
                            className="flex-1 py-1.5 bg-[#FFFFFF] text-[#111111] text-xs font-semibold rounded hover:bg-[#E2E2E2] disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Set Secret"}
                        </button>
                    </div>
                </form>

                <div className="mt-4 pt-2.5 border-t border-[#222222] flex items-center justify-center gap-1.5 text-[10px] text-[#888888] font-mono">
                    <ShieldCheck size={12} className="text-[#00CC00]" />
                    <span>Hashed verifier stored on backend</span>
                </div>
            </div>
        </div>
    );
};

export default SetSecretModal;
