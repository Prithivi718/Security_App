import React from "react";
import { Settings } from "lucide-react";

const SettingsPage = () => (
    <div className="flex h-full items-center justify-center bg-[#F9F9F9] font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
            <Settings size={36} strokeWidth={1.4} className="text-[#B3B3B3]" />
            <p className="text-sm font-medium text-[#2B2B2B]">Settings</p>
            <p className="text-xs text-[#999999]">Profile &amp; account settings — coming soon.</p>
        </div>
    </div>
);

export default SettingsPage;
