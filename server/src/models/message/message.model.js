import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
    {
        // ------------------------------------------
        // Conversation reference
        // Exactly one should be present
        // ------------------------------------------

        friendshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Friendship",
            default: null,
            index: true,
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
            index: true,
        },


        // ------------------------------------------
        // Sender
        // ------------------------------------------

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },


        // ------------------------------------------
        // AES-GCM encrypted message
        // ------------------------------------------

        ciphertext: {
            type: String,
            required: true,
        },

        nonce: {
            type: String,
            required: true,
        },

        authTag: {
            type: String,
            required: true,
        },


        // ------------------------------------------
        // Cryptographic versioning
        // ------------------------------------------

        keyVersion: {
            type: Number,
            required: true,
            default: 1,
        },

        cryptoVersion: {
            type: Number,
            required: true,
            default: 1,
        },


        // ------------------------------------------
        // Message metadata
        // ------------------------------------------

        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "file",
                "system",
            ],
            default: "text",
        },

        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        updatedAt: {
            type: Date,
            default: null,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);


// ==================================================
// Ensure exactly one conversation exists
// ==================================================

messageSchema.pre("validate", function (next) {

    const hasFriendship = !!this.friendshipId;
    const hasGroup = !!this.groupId;

    if (hasFriendship === hasGroup) {
        return next(
            new Error(
                "Message must belong to either a friendship or a group"
            )
        );
    }

    next();
});


// ==================================================
// Helpful indexes
// ==================================================

messageSchema.index({
    friendshipId: 1,
    createdAt: -1,
});

messageSchema.index({
    groupId: 1,
    createdAt: -1,
});


const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;