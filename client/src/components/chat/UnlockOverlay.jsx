import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Key } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

const UnlockOverlay = ({ onEstablishSecretClick }) => {
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

    const isSecretEstablished = activeConversation.secretEstablished;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-200">
            <div className="w-full max-w-sm bg-[#FFFFFF] text-[#111111] border border-[#E5E5E5] rounded-xl shadow-2xl p-6 flex flex-col items-center text-center">
                {/* Security Icon */}
                <div className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111] mb-4 shadow-xs">
                    <Lock size={22} />
                </div>

                <h3 className="text-base font-bold tracking-tight text-[#111111] font-sans">
                    Unlock Secure Chat
                </h3>
                <p className="text-xs text-[#666666] mt-1.5 leading-relaxed font-sans max-w-xs">
                    {!isSecretEstablished ? (
                        <>Shared secret key has not been established for <span className="font-semibold text-[#111111]">{activeConversation.name}</span>. Set a secret code first to start chatting.</>
                    ) : (
                        <>Enter your shared secret for <span className="font-semibold text-[#111111]">{activeConversation.name}</span> to authenticate and derive your local encryption key.</>
                    )}
                </p>

                {/* Form or Set Secret Prompt */}
                {!isSecretEstablished ? (
                    <div className="w-full mt-5">
                        <button
                            type="button"
                            onClick={() => onEstablishSecretClick && onEstablishSecretClick(activeConversation)}
                            className="w-full py-2.5 bg-[#111111] text-[#FFFFFF] font-semibold text-xs rounded-lg hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-2 shadow-xs"
                        >
                            <Key size={14} />
                            <span>Set Shared Secret Key</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col gap-3.5">
                        <div className="relative">
                            <input
                                type={showSecret ? "text" : "password"}
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                placeholder="Enter shared secret..."
                                disabled={isLoading}
                                autoFocus
                                className="w-full px-3.5 py-2.5 pr-10 bg-[#FAFAFA] border border-[#D4D4D4] rounded-lg text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] focus:bg-[#FFFFFF] font-mono transition-colors shadow-xs"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#111111] transition-colors p-0.5"
                            >
                                {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        {error && (
                            <div className="text-[11px] text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] p-2.5 rounded-lg text-left font-mono flex flex-col gap-2">
                                <div>{error}</div>
                                {error.includes("Shared secret has not been established") && (
                                    <button
                                        type="button"
                                        onClick={() => onEstablishSecretClick && onEstablishSecretClick(activeConversation)}
                                        className="mt-1 w-full py-1.5 bg-[#111111] text-[#FFFFFF] text-xs font-sans font-semibold rounded hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                    >
                                        <Key size={13} />
                                        <span>Set Shared Secret Key Now</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !secretCode}
                            className="w-full py-2.5 bg-[#111111] text-[#FFFFFF] font-semibold text-xs rounded-lg hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-xs"
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
                )}

                {/* Footer Security Note */}
                <div className="mt-5 pt-3 border-t border-[#F0F0F0] w-full flex items-center justify-center gap-1.5 text-[10px] text-[#737373] font-mono">
                    <ShieldCheck size={12} className="text-[#16A34A]" />
                    <span>Session expires after 10 minutes</span>
                </div>
            </div>
        </div>
    );
};

export default UnlockOverlay;
