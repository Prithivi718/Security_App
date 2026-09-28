import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // One of these two must be present
        friendshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Friendship",
            default: null,
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "expired", "revoked"],
            default: "active",
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


// ---------------------------------------------
// Exactly ONE conversation must be specified
// ---------------------------------------------

chatSessionSchema.pre("validate", function () {

    const hasFriendship = !!this.friendshipId;
    const hasGroup = !!this.groupId;

    if (hasFriendship === hasGroup) {
        throw new Error(
            "A chat session must belong to either a friendship or a group"
        );
    }
});


// ---------------------------------------------
// Query indexes
// ---------------------------------------------

chatSessionSchema.index({
    userId: 1,
    friendshipId: 1,
    status: 1,
    expiresAt: 1,
});

chatSessionSchema.index({
    userId: 1,
    groupId: 1,
    status: 1,
    expiresAt: 1,
});


const ChatSession = mongoose.model(
    "ChatSession",
    chatSessionSchema
);

export default ChatSession;