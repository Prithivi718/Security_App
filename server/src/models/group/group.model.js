import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
            required: true
        },

        status: {
            type: String,
            enum: ["active", "left", "removed"],
            default: "active",
            required: true
        },

        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: false
    }
);

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: {
            type: [groupMemberSchema],
            default: []
        },

        status: {
            type: String,
            enum: ["active", "archived", "deleted"],
            default: "active",
            required: true
        },

        secretVerifier: {
            type: String,
            required: true,
            select: false
        },
        
        secretSalt: {
            type: String,
            required: true,
            select: false
        },
        
        kdfSalt: {
            type: String,
            required: true,
            select: false
        },

        cryptoVersion: {
            type: Number,
            required: true,
            default: 1
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;