import React, { useState } from "react";
import { Search, Lock, Unlock, Users, User, ShieldAlert, Key } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ConversationList = ({ onEstablishSecretClick }) => {
    const { user: currentUser } = useAuth();
    const {
        contacts,
        isLoadingContacts,
        contactsError,
        activeConversation,
        selectConversation,
        activeSessions
    } = useChat();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'friends' | 'groups'

    const friendsList = (contacts.friends || []).map(f => {
        const friendUser = f.user || {};
        const isSecretEstablished = Boolean(f.secretVerifier || f.cryptoVersion);
        return {
            type: "friendship",
            id: f.friendshipId,
            name: friendUser.userName || "Friend",
            email: friendUser.emailId,
            user: friendUser,
            secretEstablished: isSecretEstablished,
            updatedAt: f.updatedAt
        };
    });

    const groupsList = (contacts.groups || []).map(g => ({
        type: "group",
        id: g._id,
        name: g.name || "Group",
        memberCount: g.members?.length || 0,
        secretEstablished: true, // Groups require secret upon creation
        updatedAt: g.updatedAt
    }));

    let allConversations = [];
    if (activeTab === "all") {
        allConversations = [...friendsList, ...groupsList];
    } else if (activeTab === "friends") {
        allConversations = friendsList;
    } else {
        allConversations = groupsList;
    }

    // Filter by search query
    const filtered = allConversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-80 shrink-0 border-r border-[#D4D4D4] bg-[#F4F4F4]">
            {/* Header & Search */}
            <div className="p-3 border-b border-[#D4D4D4] bg-[#FFFFFF] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#111111] uppercase font-mono">
                        Conversations
                    </span>
                    <span className="text-[10px] text-[#666666] font-mono">
                        {filtered.length} total
                    </span>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-8 pr-3 py-1.5 bg-[#F9F9F9] border border-[#D4D4D4] rounded text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] font-sans transition-colors"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 pt-1">
                    {[
                        { id: "all", label: "All" },
                        { id: "groups", label: "Groups" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${activeTab === tab.id
                                ? "bg-[#111111] text-[#FFFFFF]"
                                : "bg-[#EFEFEF] text-[#444444] hover:bg-[#E2E2E2]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#EAEAEA]">
                {isLoadingContacts ? (
                    <div className="p-4 text-center text-xs text-[#777777] font-mono">
                        Loading conversations...
                    </div>
                ) : contactsError ? (
                    <div className="p-4 text-center text-xs text-[#CC0000] font-mono">
                        {contactsError}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#888888]">
                        No conversations found.
                    </div>
                ) : (
                    filtered.map((conv) => {
                        const convId = `${conv.type}:${conv.id}`;
                        const isSelected = activeConversation && activeConversation.type === conv.type && activeConversation.id === conv.id;
                        const session = activeSessions[convId];
                        const isUnlocked = Boolean(session && session.remainingSeconds > 0);

                        return (
                            <button
                                key={convId}
                                onClick={() => selectConversation(conv)}
                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors relative ${isSelected
                                    ? "bg-[#EAEAEA] border-l-2 border-[#111111]"
                                    : "bg-[#F4F4F4] hover:bg-[#EFEFEF]"
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-xs select-none">
                                        {conv.name[0]?.toUpperCase() || "?"}
                                    </div>
                                    {conv.type === "group" && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#444444] text-[#FFFFFF] flex items-center justify-center border border-[#FFFFFF]">
                                            <Users size={9} />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[#111111] truncate">
                                            {conv.name}
                                        </span>
                                        {/* Lock status indicator */}
                                        <div className="flex items-center gap-1">
                                            {isUnlocked ? (
                                                <span className="flex items-center gap-0.5 text-[10px] font-mono text-[#008800] bg-[#E6F4E6] px-1.5 py-0.5 rounded">
                                                    <Unlock size={10} />
                                                    <span>{session.remainingSeconds}s</span>
                                                </span>
                                            ) : (
                                                <span className="text-[#888888] p-0.5" title="Chat is locked">
                                                    <Lock size={12} />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subtitle / Status */}
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className="text-[11px] text-[#666666] truncate font-mono">
                                            {conv.type === "group"
                                                ? `${conv.memberCount} members`
                                                : conv.secretEstablished
                                                    ? (isUnlocked ? "Session active" : "Locked conversation")
                                                    : "Secret not set"}
                                        </span>

                                        {!conv.secretEstablished && conv.type === "friendship" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onEstablishSecretClick) onEstablishSecretClick(conv);
                                                }}
                                                className="text-[10px] bg-[#111111] text-[#FFFFFF] px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-[#333333]"
                                                title="Set shared secret"
                                            >
                                                <Key size={10} />
                                                <span>Set Key</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
