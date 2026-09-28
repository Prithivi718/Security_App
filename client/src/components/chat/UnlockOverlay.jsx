import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Key } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

const UnlockOverlay = () => {
    const { activeConversation, unlockCurrentChat } = useChat();

    const [secretCode, setSecretCode] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!activeConversation) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!secretCode) {
            setError("Shared secret code is required");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await unlockCurrentChat(secretCode);
            setSecretCode(""); // Purge local input state immediately
        } catch (err) {
            setError(err.message || "Invalid shared secret code. Verification failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm transition-all duration-200">
            <div className="w-full max-w-sm bg-[#111111] text-[#FFFFFF] border border-[#333333] rounded-lg shadow-2xl p-6 flex flex-col items-center text-center">
                {/* Security Icon */}
                <div className="w-12 h-12 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center text-[#FFFFFF] mb-4 shadow-inner">
                    <Lock size={22} />
                </div>

                <h3 className="text-base font-semibold tracking-tight text-[#FFFFFF] font-sans">
                    Unlock Secure Chat
                </h3>
                <p className="text-xs text-[#AAAAAA] mt-1.5 leading-relaxed font-sans max-w-xs">
                    Enter your shared secret for <span className="font-semibold text-[#FFFFFF]">{activeConversation.name}</span> to authenticate and derive your local encryption key.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col gap-3.5">
                    <div className="relative">
                        <input
                            type={showSecret ? "text" : "password"}
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Enter shared secret..."
                            disabled={isLoading}
                            autoFocus
                            className="w-full px-3 py-2 pr-10 bg-[#1A1A1A] border border-[#333333] rounded text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#666666] font-mono transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#FFFFFF] transition-colors p-0.5"
                        >
                            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>

                    {error && (
                        <div className="text-[11px] text-[#FF4D4D] bg-[#2A1515] border border-[#552222] p-2 rounded text-left font-mono">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !secretCode}
                        className="w-full py-2 bg-[#FFFFFF] text-[#111111] font-semibold text-xs rounded hover:bg-[#E2E2E2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="font-mono">Deriving key...</span>
                        ) : (
                            <>
                                <Key size={14} />
                                <span>Unlock Chat</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Security Note */}
                <div className="mt-5 pt-3 border-t border-[#222222] w-full flex items-center justify-center gap-1.5 text-[10px] text-[#888888] font-mono">
                    <ShieldCheck size={12} className="text-[#00CC00]" />
                    <span>Session expires after 10 minutes</span>
                </div>
            </div>
        </div>
    );
};

export default UnlockOverlay;
