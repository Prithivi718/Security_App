import React, { useState } from "react";
import { ChatProvider, useChat } from "../../context/ChatContext.jsx";
import ConversationList from "../../components/chat/ConversationList.jsx";
import EmptyChatLanding from "../../components/chat/EmptyChatLanding.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatMessageArea from "../../components/chat/ChatMessageArea.jsx";
import MessageComposer from "../../components/chat/MessageComposer.jsx";
import UnlockOverlay from "../../components/chat/UnlockOverlay.jsx";
import SetSecretModal from "../../components/chat/SetSecretModal.jsx";

const ChatContent = () => {
    const { activeConversation, isCurrentUnlocked } = useChat();
    const [establishSecretConv, setEstablishSecretConv] = useState(null);

    return (
        <div className="flex h-full w-full bg-[#FFFFFF] overflow-hidden">
            {/* Conversation list sidebar */}
            <ConversationList
                onEstablishSecretClick={(conv) => setEstablishSecretConv(conv)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#F9F9F9]">
                {!activeConversation ? (
                    <EmptyChatLanding />
                ) : (
                    <>
                        <ChatHeader />

                        <div className="flex-1 flex flex-col min-h-0 relative">
                            {/* Blurred background if locked */}
                            <div className={`flex-1 flex flex-col min-h-0 transition-all duration-200 ${!isCurrentUnlocked ? "filter blur-sm select-none pointer-events-none opacity-40" : ""}`}>
                                <ChatMessageArea />
                                <MessageComposer />
                            </div>

                            {/* Centered Unlock Overlay */}
                            {!isCurrentUnlocked && <UnlockOverlay />}
                        </div>
                    </>
                )}
            </div>

            {/* Establish Secret Modal */}
            {establishSecretConv && (
                <SetSecretModal
                    conversation={establishSecretConv}
                    onClose={() => setEstablishSecretConv(null)}
                />
            )}
        </div>
    );
};

const ChatsPage = () => {
    return (
        <ChatProvider>
            <ChatContent />
        </ChatProvider>
    );
};

export default ChatsPage;
