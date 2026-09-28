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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#FFFFFF] text-[#111111] border border-[#E5E5E5] rounded-xl shadow-2xl p-6 relative flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#737373] hover:text-[#111111] transition-colors p-1"
                >
                    <X size={16} />
                </button>

                <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111] mb-3 shadow-xs">
                    <Key size={18} />
                </div>

                <h3 className="text-sm font-bold text-[#111111] tracking-tight font-sans">
                    Establish Shared Secret
                </h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed font-sans">
                    Set a secret code for your friendship with <span className="font-semibold text-[#111111]">{conversation.name}</span>. Both participants must enter this exact secret code to unlock chats.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type={showSecret ? "text" : "password"}
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Enter shared secret..."
                            disabled={isLoading}
                            className="w-full px-3.5 py-2.5 pr-10 bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF] font-mono shadow-xs transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#111111] p-0.5"
                        >
                            {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    <input
                        type={showSecret ? "text" : "password"}
                        value={confirmSecret}
                        onChange={(e) => setConfirmSecret(e.target.value)}
                        placeholder="Confirm shared secret..."
                        disabled={isLoading}
                        className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF] font-mono shadow-xs transition-colors"
                    />

                    {error && (
                        <div className="text-[11px] text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] p-2.5 rounded-lg font-mono">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-[#F5F5F5] border border-[#E5E5E5] text-[#525252] text-xs font-semibold rounded-lg hover:bg-[#E5E5E5] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !secretCode || !confirmSecret}
                            className="flex-1 py-2 bg-[#111111] text-[#FFFFFF] text-xs font-semibold rounded-lg hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors shadow-xs"
                        >
                            {isLoading ? "Saving..." : "Set Secret"}
                        </button>
                    </div>
                </form>

                <div className="mt-4 pt-2.5 border-t border-[#F0F0F0] flex items-center justify-center gap-1.5 text-[10px] text-[#737373] font-mono">
                    <ShieldCheck size={12} className="text-[#16A34A]" />
                    <span>Hashed verifier stored on backend</span>
                </div>
            </div>
        </div>
    );
};

export default SetSecretModal;
