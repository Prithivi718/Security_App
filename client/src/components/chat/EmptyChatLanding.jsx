import React from "react";
import { Shield, Lock } from "lucide-react";

const EmptyChatLanding = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F9] p-8 text-center select-none">
            <div className="flex flex-col items-center max-w-sm gap-4">
                {/* Security shield badge icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#111111] text-[#FFFFFF] flex items-center justify-center shadow-sm relative">
                    <Shield size={32} strokeWidth={1.5} />
                    <div className="absolute -bottom-1 -right-1 bg-[#262626] text-[#FFFFFF] p-1 rounded-full border-2 border-[#F9F9F9]">
                        <Lock size={12} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-[#111111] tracking-tight font-sans">
                        Your conversations stay private.
                    </h2>
                    <p className="text-xs text-[#777777] leading-relaxed font-sans">
                        End-to-end encrypted messaging with zero server plaintext persistence. Select a conversation from the sidebar to continue.
                    </p>
                </div>

                <div className="pt-3 border-t border-[#EAEAEA] w-full flex items-center justify-center gap-2 text-[11px] text-[#888888] font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#00AA00]"></span>
                    <span>AES-256-GCM + HKDF local derivation active</span>
                </div>
            </div>
        </div>
    );
};

export default EmptyChatLanding;
