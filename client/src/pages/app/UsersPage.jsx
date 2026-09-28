import React, { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Check, UserCheck, Clock, Users, UserX, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import userService from "../../services/user.service.js";
import friendshipService from "../../services/friendship.service.js";

/**
 * UsersPage — Find People & Friend Requests Management (Light Mode Theme)
 * Pure clean white & subtle gray palette matching app header.
 */
const UsersPage = () => {
    const { user: currentUser } = useAuth();

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Friend requests state
    const [activeTab, setActiveTab] = useState("received"); // 'received' | 'sent'
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    // Action tracking state for loading indicators
    const [actionLoading, setActionLoading] = useState({});

    // Fetch friend requests
    const fetchRequests = useCallback(async () => {
        setIsLoadingRequests(true);
        try {
            const res = await friendshipService.getPendingFriendRequests();
            const data = res.data || res;
            if (data) {
                setPendingRequests(data.invitations || data.received || data.pending || (Array.isArray(data) ? data : []));
                setSentRequests(data.sent || []);
            }
        } catch (error) {
            console.error("Failed to load friend requests", error);
        } finally {
            setIsLoadingRequests(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Handle User Search
    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await userService.searchUsers(searchQuery.trim());
            const users = res.users || res.data?.users || res.data || (Array.isArray(res) ? res : []);
            const currentId = currentUser?._id || currentUser?.id;
            const filtered = Array.isArray(users)
                ? users.filter((u) => {
                    const uId = u._id || u.id;
                    return currentId ? uId !== currentId : true;
                })
                : [];
            setSearchResults(filtered);
        } catch (error) {
            console.error("User search failed", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Send Friend Request
    const handleSendRequest = async (targetUserId) => {
        setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
        try {
            await friendshipService.sendFriendRequest(targetUserId);
            await fetchRequests();
            if (searchQuery.trim()) handleSearch();
        } catch (error) {
            console.error("Failed to send friend request", error);
        } finally {
            setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
        }
    };

    // Accept Friend Request with optional secret code prompt
    const handleAcceptRequest = async (friendshipId) => {
        const secretCode = window.prompt("Enter a shared secret code for this friendship (e.g. 1234):");
        if (!secretCode || secretCode.trim().length < 4) {
            alert("Secret code must be at least 4 characters long.");
            return;
        }

        setActionLoading((prev) => ({ ...prev, [friendshipId]: true }));
        try {
            await friendshipService.acceptFriendRequest(friendshipId);
            await friendshipService.setSharedSecret(friendshipId, secretCode.trim());
            alert(`Shared secret successfully set! Secret: ${secretCode.trim()}\n\nNote: Keep this secret safe! Both participants must use this code to unlock chats.`);
            await fetchRequests();
            if (searchQuery.trim()) handleSearch();
        } catch (error) {
            console.error("Failed to accept friend request or set secret", error);
            alert(error.message || "Failed to accept friend request");
        } finally {
            setActionLoading((prev) => ({ ...prev, [friendshipId]: false }));
        }
    };

    // Determine Relationship Status
    const getRelationshipStatus = (userItem) => {
        const userId = userItem._id || userItem.id;
        const currentId = currentUser?._id || currentUser?.id;

        const incoming = pendingRequests.find((r) => {
            const sender = r.requestedBy || r.requester || r.user || r;
            const senderId = typeof sender === "object" ? (sender._id || sender.id) : sender;
            return String(senderId) === String(userId);
        });
        if (incoming) return { state: "INCOMING", friendshipId: incoming._id || incoming.id };

        const outgoing = sentRequests.find((r) => {
            const uA = r.userAId;
            const uB = r.userBId;
            const uAId = typeof uA === "object" ? (uA._id || uA.id) : uA;
            const uBId = typeof uB === "object" ? (uB._id || uB.id) : uB;
            const rec = r.recipient;
            const recId = typeof rec === "object" ? (rec._id || rec.id) : rec;

            return String(recId) === String(userId) ||
                (String(uAId) === String(currentId) && String(uBId) === String(userId)) ||
                (String(uBId) === String(currentId) && String(uAId) === String(userId));
        });
        if (outgoing) return { state: "SENT", friendshipId: outgoing._id || outgoing.id };

        if (userItem.isFriend || userItem.status === "accepted") return { state: "FRIENDS" };

        return { state: "NONE" };
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] font-sans overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Find People</h1>
                    <p className="text-sm text-[#666666] mt-1">
                        Search for people by username, email, or name to connect on SecureNet.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email or username..."
                        className="w-full h-11 pl-10 pr-24 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] shadow-xs transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 h-8 bg-[#111111] hover:bg-[#2A2A2A] text-xs font-semibold text-[#FFFFFF] rounded-md transition-colors flex items-center gap-1.5"
                    >
                        {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                    </button>
                </form>

                {/* Search Results Section */}
                {hasSearched && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                            Search Results ({searchResults.length})
                        </h2>

                        {searchResults.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-center shadow-xs">
                                <UserX className="h-8 w-8 text-[#A3A3A3] mb-2" />
                                <p className="text-sm font-medium text-[#404040]">No users found</p>
                                <p className="text-xs text-[#737373] mt-1">
                                    Try checking for typos or searching with a different term.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F5F5F5] bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden shadow-xs">
                                {searchResults.map((userItem) => {
                                    const userId = userItem._id || userItem.id;
                                    const status = getRelationshipStatus(userItem);
                                    const isLoading = actionLoading[userId] || actionLoading[status.friendshipId];

                                    return (
                                        <div key={userId} className="flex items-center justify-between p-4 hover:bg-[#F9F9F9] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-sm select-none">
                                                    {(userItem.userName || userItem.fullName || "U")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#111111]">
                                                        {userItem.fullName || userItem.userName}
                                                    </p>
                                                    <p className="text-xs text-[#666666]">
                                                        @{userItem.userName} {userItem.email ? `• ${userItem.email}` : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                {status.state === "NONE" && (
                                                    <button
                                                        onClick={() => handleSendRequest(userId)}
                                                        disabled={isLoading}
                                                        className="h-8 px-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
                                                    >
                                                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                                                        Add Friend
                                                    </button>
                                                )}

                                                {status.state === "SENT" && (
                                                    <button
                                                        disabled
                                                        className="h-8 px-3.5 bg-[#F5F5F5] text-[#737373] font-medium text-xs rounded-md border border-[#E5E5E5] flex items-center gap-1.5 cursor-default"
                                                    >
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Request Sent
                                                    </button>
                                                )}

                                                {status.state === "INCOMING" && (
                                                    <button
                                                        onClick={() => handleAcceptRequest(status.friendshipId)}
                                                        disabled={isLoading}
                                                        className="h-8 px-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
                                                    >
                                                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                                        Accept
                                                    </button>
                                                )}

                                                {status.state === "FRIENDS" && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] text-xs font-semibold rounded-md">
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        Friends
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Friend Requests Section */}
                <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-[#111111]">Friend Requests</h2>

                        {/* Light Mode Segmented Control */}
                        <div className="flex p-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-xs font-semibold">
                            <button
                                onClick={() => setActiveTab("received")}
                                className={`px-3.5 py-1 rounded-md transition-colors ${activeTab === "received"
                                    ? "bg-[#FFFFFF] text-[#111111] shadow-xs"
                                    : "text-[#737373] hover:text-[#111111]"
                                    }`}
                            >
                                Received ({pendingRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("sent")}
                                className={`px-3.5 py-1 rounded-md transition-colors ${activeTab === "sent"
                                    ? "bg-[#FFFFFF] text-[#111111] shadow-xs"
                                    : "text-[#737373] hover:text-[#111111]"
                                    }`}
                            >
                                Sent ({sentRequests.length})
                            </button>
                        </div>
                    </div>

                    {/* Received Tab Content */}
                    {activeTab === "received" && (
                        <div>
                            {isLoadingRequests ? (
                                <div className="flex items-center justify-center p-8 text-[#737373] gap-2 text-xs">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading requests...
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-center shadow-xs">
                                    <Users className="h-8 w-8 text-[#A3A3A3] mb-2" />
                                    <p className="text-sm font-medium text-[#525252]">No pending friend requests.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#F5F5F5] bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden shadow-xs">
                                    {pendingRequests.map((req) => {
                                        const reqId = req._id || req.id;
                                        const sender = req.requestedBy || req.requester || req.user || req;
                                        const displayName = sender.userName || sender.fullName || sender.emailId || "User";
                                        const avatarInitial = displayName[0]?.toUpperCase() || "U";
                                        const isLoading = actionLoading[reqId];

                                        return (
                                            <div key={reqId} className="flex items-center justify-between p-4 hover:bg-[#F9F9F9] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-sm select-none">
                                                        {avatarInitial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111111]">
                                                            {displayName}
                                                        </p>
                                                        {sender.userName && (
                                                            <p className="text-xs text-[#666666]">@{sender.userName}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleAcceptRequest(reqId)}
                                                    disabled={isLoading}
                                                    className="h-8 px-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
                                                >
                                                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                                    Accept
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sent Tab Content */}
                    {activeTab === "sent" && (
                        <div>
                            {isLoadingRequests ? (
                                <div className="flex items-center justify-center p-8 text-[#737373] gap-2 text-xs">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading sent requests...
                                </div>
                            ) : sentRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-center shadow-xs">
                                    <Users className="h-8 w-8 text-[#A3A3A3] mb-2" />
                                    <p className="text-sm font-medium text-[#525252]">No sent friend requests.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#F5F5F5] bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden shadow-xs">
                                    {sentRequests.map((req) => {
                                        const reqId = req._id || req.id;
                                        const currentId = currentUser?._id || currentUser?.id;

                                        // Target recipient is whichever participant is NOT the current user
                                        let recipient = req.recipient;
                                        if (!recipient || (!recipient.userName && !recipient.emailId)) {
                                            const uA = req.userAId;
                                            const uB = req.userBId;
                                            const uAId = typeof uA === "object" ? uA?._id : uA;
                                            const uBId = typeof uB === "object" ? uB?._id : uB;

                                            if (uAId && String(uAId) !== String(currentId) && typeof uA === "object") {
                                                recipient = uA;
                                            } else if (uBId && String(uBId) !== String(currentId) && typeof uB === "object") {
                                                recipient = uB;
                                            } else {
                                                recipient = req;
                                            }
                                        }

                                        const displayName = recipient.userName || recipient.fullName || recipient.emailId || "User";
                                        const avatarInitial = displayName[0]?.toUpperCase() || "U";

                                        return (
                                            <div key={reqId} className="flex items-center justify-between p-4 hover:bg-[#F9F9F9] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-sm select-none">
                                                        {avatarInitial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111111]">
                                                            {displayName}
                                                        </p>
                                                        {recipient.userName && (
                                                            <p className="text-xs text-[#666666]">@{recipient.userName}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-xs font-semibold rounded-md">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Request Pending
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
