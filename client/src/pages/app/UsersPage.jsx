import React from "react";
import { Users } from "lucide-react";

const UsersPage = () => (
    <div className="flex h-full items-center justify-center bg-[#F9F9F9] font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
            <Users size={36} strokeWidth={1.4} className="text-[#B3B3B3]" />
            <p className="text-sm font-medium text-[#2B2B2B]">Users</p>
            <p className="text-xs text-[#999999]">User discovery &amp; friend management — coming soon.</p>
        </div>
    </div>
);

export default UsersPage;
