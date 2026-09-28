import React from "react";
import { Lock, Unlock, Users, Shield, LogOut } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

const formatTimer = (seconds) => {
    if (!seconds || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const ChatHeader = ({ onEstablishSecretClick }) => {
    const { activeConversation, isCurrentUnlocked, currentSession, lockConversation } = useChat();

    if (!activeConversation) return null;

    const remainingSeconds = currentSession?.remainingSeconds || 0;
    const isSecretEstablished = activeConversation.secretEstablished;

    return (
        <div className="h-14 shrink-0 px-4 bg-[#FFFFFF] border-b border-[#D4D4D4] flex items-center justify-between">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-xs select-none">
                        {activeConversation.name[0]?.toUpperCase() || "?"}
                    </div>
                    {activeConversation.type === "group" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#444444] text-[#FFFFFF] flex items-center justify-center border border-[#FFFFFF]">
                            <Users size={9} />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-[#111111] tracking-tight font-sans">
                        {activeConversation.name}
                    </h3>
                    <p className="text-[11px] text-[#777777] font-mono">
                        {activeConversation.type === "group"
                            ? `${activeConversation.memberCount || 0} members`
                            : activeConversation.user?.email || "Friend conversation"}
                    </p>
                </div>
            </div>

            {/* Right: Session Badge & Actions */}
            <div className="flex items-center gap-2">
                {!isSecretEstablished && activeConversation.type === "friendship" && (
                    <button
                        onClick={() => onEstablishSecretClick && onEstablishSecretClick(activeConversation)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
                    >
                        <Shield size={13} />
                        <span>Set Secret Key</span>
                    </button>
                )}

                {isCurrentUnlocked ? (
                    <>
                        <div className="flex items-center gap-1.5 bg-[#EAF5EA] text-[#006600] px-2.5 py-1 rounded border border-[#C2E0C2] text-xs font-mono">
                            <Lock size={12} />
                            <span>Secure session</span>
                            <span className="font-bold text-[#111111]">· {formatTimer(remainingSeconds)}</span>
                        </div>

                        <button
                            onClick={() => lockConversation()}
                            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#F0F0F0] rounded transition-colors"
                            title="Lock conversation"
                        >
                            <LogOut size={16} />
                        </button>
                    </>
                ) : (
                    isSecretEstablished && (
                        <div className="flex items-center gap-1.5 bg-[#F4F4F4] text-[#777777] px-2.5 py-1 rounded border border-[#D4D4D4] text-xs font-mono">
                            <Lock size={12} />
                            <span>Locked</span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ChatHeader;
