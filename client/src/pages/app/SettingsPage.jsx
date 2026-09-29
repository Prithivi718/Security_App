import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat, ChatProvider } from "../../context/ChatContext";
import SetSecretModal from "../../components/chat/SetSecretModal";
import {
    User,
    ShieldCheck,
    Bell,
    Lock,
    Key,
    Smartphone,
    LogOut,
    Check,
    Moon,
    Volume2,
    Eye,
    ChevronRight,
    ShieldAlert,
    X,
    MessageSquare
} from "lucide-react";

const SettingsPageContent = () => {
    const { user, logout, updateProfile } = useAuth();
    const chatContext = useChat();
    const contacts = chatContext?.contacts || { friends: [], groups: [] };
    const fetchContacts = chatContext?.fetchContacts || (() => { });
    const [activeTab, setActiveTab] = useState("profile");

    // Secret Keys Modal state
    const [isSecretKeysModalOpen, setIsSecretKeysModalOpen] = useState(false);
    const [selectedFriendForSecret, setSelectedFriendForSecret] = useState(null);

    // Profile editing state
    const [userName, setUserName] = useState(user?.userName || "");
    const [emailId, setEmailId] = useState(user?.emailId || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

    // Update local inputs if user object changes
    React.useEffect(() => {
        if (user) {
            setUserName(user.userName || "");
            setEmailId(user.emailId || "");
        }
    }, [user]);

    // Refresh chat contacts when opening security tab
    useEffect(() => {
        if (activeTab === "security" && fetchContacts) {
            fetchContacts();
        }
    }, [activeTab, fetchContacts]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccessMsg("");

        if (!userName.trim() || !emailId.trim()) {
            setProfileError("Username and Email cannot be empty.");
            return;
        }

        setIsSavingProfile(true);
        const res = await updateProfile({ userName, emailId });
        setIsSavingProfile(false);

        if (res.success) {
            setProfileSuccessMsg("Profile updated successfully!");
            setTimeout(() => setProfileSuccessMsg(""), 3000);
        } else {
            setProfileError(res.message || "Failed to update profile.");
        }
    };

    // Local preferences state persisted in localStorage
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("securenet_notifications");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // ignore
            }
        }
        return {
            sound: true,
            desktop: true,
            readReceipts: true,
            onlineStatus: true,
        };
    });

    const [savedNotice, setSavedNotice] = useState(false);

    const toggleNotification = (key) => {
        setNotifications((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem("securenet_notifications", JSON.stringify(next));
            showSaveFeedback();
            return next;
        });
    };

    const showSaveFeedback = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const userInitial = user?.userName
        ? user.userName.charAt(0).toUpperCase()
        : "U";

    const memberSinceDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        })
        : "Recent";

    return (
        <div className="flex h-full w-full bg-[#FAFAFA] font-sans text-[#2B2B2B] overflow-hidden">
            {/* Settings Sidebar Navigation */}
            <aside className="w-64 border-r border-[#EBEBEB] bg-white flex flex-col p-6 space-y-6 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Settings</h2>
                    <p className="text-xs text-[#808080] mt-1">Manage your account & preferences</p>
                </div>

                <nav className="space-y-1 flex-1">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "profile"
                            ? "bg-[#F3F4F6] text-[#111827] font-semibold"
                            : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                            }`}
                    >
                        <User size={18} className={activeTab === "profile" ? "text-[#111827]" : "text-[#9CA3AF]"} />
                        Profile Settings
                    </button>

                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "security"
                            ? "bg-[#F3F4F6] text-[#111827] font-semibold"
                            : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                            }`}
                    >
                        <ShieldCheck size={18} className={activeTab === "security" ? "text-[#111827]" : "text-[#9CA3AF]"} />
                        Security & E2EE
                    </button>

                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "notifications"
                            ? "bg-[#F3F4F6] text-[#111827] font-semibold"
                            : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                            }`}
                    >
                        <Bell size={18} className={activeTab === "notifications" ? "text-[#111827]" : "text-[#9CA3AF]"} />
                        Notifications & Privacy
                    </button>
                </nav>

                {/* Toast feedback */}
                {savedNotice && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md transition-all">
                        <Check size={14} />
                        Preferences updated
                    </div>
                )}

                <div className="pt-4 border-t border-[#EBEBEB]">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl">
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#111827]">Public Profile</h3>
                            <p className="text-xs text-[#6B7280]">Personal details associated with your account.</p>
                        </div>

                        {/* Profile Info Card */}
                        <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-[#111827] text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
                                    {userInitial}
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-[#111827]">{user?.userName || "User"}</h4>
                                    <p className="text-xs text-[#6B7280]">{user?.emailId || "user@example.com"}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Active Account
                                        </span>
                                        <span className="text-[11px] text-[#9CA3AF]">Member since {memberSinceDate}</span>
                                    </div>
                                </div>
                            </div>

                            {profileError && (
                                <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    {profileError}
                                </div>
                            )}

                            {profileSuccessMsg && (
                                <div className="p-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                                    <Check size={16} />
                                    {profileSuccessMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F3F4F6]">
                                <div>
                                    <label className="block text-xs font-semibold text-[#374151] mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#374151] mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={emailId}
                                        onChange={(e) => setEmailId(e.target.value)}
                                        className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>

                        {/* Account Verification Details */}
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
                            <h4 className="text-sm font-semibold text-[#111827]">Account Security Status</h4>
                            <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Email Verified</p>
                                        <p className="text-[11px] text-[#6B7280]">Your email has been authenticated via OTP.</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#111827]">Security & Encryption</h3>
                            <p className="text-xs text-[#6B7280]">Control end-to-end cryptographic keys and privacy controls.</p>
                        </div>

                        {/* E2EE Info Box */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                                <Key size={16} />
                                End-to-End Encrypted (AES-256-GCM / ECDH)
                            </div>
                            <h4 className="text-base font-semibold">Zero-Knowledge Architecture</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Messages exchanged in SecureNet are encrypted on your client using a secret derived key.
                                The server only relays ciphertexts and cannot decrypt your private conversations.
                            </p>
                        </div>

                        {/* Security Actions */}
                        <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#F3F4F6] shadow-sm">
                            <button
                                onClick={() => setIsSecretKeysModalOpen(true)}
                                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#F9FAFB] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-[#4B5563] group-hover:text-[#111827] transition-colors" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Conversation Secret Keys</p>
                                        <p className="text-[11px] text-[#6B7280]">Manage individual shared keys for direct messages.</p>
                                    </div>
                                </div>
                                <span className="text-xs text-[#6B7280] group-hover:text-[#111827] font-medium flex items-center gap-1 transition-colors">
                                    Active per chat ({contacts?.friends?.length || 0} contacts) <ChevronRight size={14} />
                                </span>
                            </button>

                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-[#4B5563]" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Active Sessions</p>
                                        <p className="text-[11px] text-[#6B7280]">Currently logged in on this browser.</p>
                                    </div>
                                </div>
                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    Current Device
                                </span>
                            </div>
                        </div>

                        {/* Secret Keys Management Modal */}
                        {isSecretKeysModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                                <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl shadow-2xl p-6 relative flex flex-col space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                                        <div className="flex items-center gap-2">
                                            <Key size={18} className="text-[#111827]" />
                                            <h4 className="text-sm font-bold text-[#111827]">Shared Secret Keys</h4>
                                        </div>
                                        <button
                                            onClick={() => setIsSecretKeysModalOpen(false)}
                                            className="text-[#9CA3AF] hover:text-[#111827] p-1 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <p className="text-xs text-[#6B7280]">
                                        Select a friend to set or update the shared encryption secret key required to read messages.
                                    </p>

                                    <div className="max-h-64 overflow-y-auto divide-y divide-[#F3F4F6] border border-[#F3F4F6] rounded-lg">
                                        {(!contacts?.friends || contacts.friends.length === 0) ? (
                                            <div className="p-6 text-center text-xs text-[#9CA3AF]">
                                                No direct contacts found. Add friends to manage secret keys.
                                            </div>
                                        ) : (
                                            contacts.friends.map((friend) => (
                                                <div
                                                    key={friend.friendshipId}
                                                    className="p-3.5 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-bold">
                                                            {friend.user?.userName ? friend.user.userName.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#111827]">
                                                                {friend.user?.userName || "User"}
                                                            </p>
                                                            <p className="text-[10px] text-[#9CA3AF]">
                                                                {friend.user?.emailId || ""}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedFriendForSecret({
                                                                id: friend.friendshipId,
                                                                name: friend.user?.userName || "Friend"
                                                            });
                                                        }}
                                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${friend.secretEstablished
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-[#111827] text-white hover:bg-[#1F2937]"
                                                            }`}
                                                    >
                                                        {friend.secretEstablished ? "Update Key" : "Set Secret"}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Set Secret Key Sub-Modal */}
                        {selectedFriendForSecret && (
                            <SetSecretModal
                                conversation={selectedFriendForSecret}
                                onClose={() => {
                                    setSelectedFriendForSecret(null);
                                    fetchContacts();
                                }}
                            />
                        )}
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#111827]">Notifications & Preferences</h3>
                            <p className="text-xs text-[#6B7280]">Customize how alerts and presence status work for you.</p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#F3F4F6] shadow-sm">
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 size={18} className="text-[#4B5563]" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Sound Alerts</p>
                                        <p className="text-[11px] text-[#6B7280]">Play sound effect on incoming encrypted messages.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleNotification("sound")}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.sound ? "bg-[#111827]" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.sound ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} className="text-[#4B5563]" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Desktop Notifications</p>
                                        <p className="text-[11px] text-[#6B7280]">Show desktop notifications for new messages.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleNotification("desktop")}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.desktop ? "bg-[#111827]" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.desktop ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye size={18} className="text-[#4B5563]" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#111827]">Online Presence</p>
                                        <p className="text-[11px] text-[#6B7280]">Allow friends to see when you are active.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleNotification("onlineStatus")}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.onlineStatus ? "bg-[#111827]" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.onlineStatus ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const SettingsPage = () => (
    <ChatProvider>
        <SettingsPageContent />
    </ChatProvider>
);

export default SettingsPage;
