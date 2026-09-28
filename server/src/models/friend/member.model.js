import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        userAId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        userBId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        status: {
            type: String,
            enum: ["accepted", "pending", "blocked"],
            default: "pending"
        },

        // -----------------------------
        // Shared-secret security
        // -----------------------------

        secretVerifier: {
            type: String,
            select: false
        },

        secretSalt: {
            type: String,
            select: false
        },
        
        kdfSalt: {
            type: String,
            select: false
        },

        cryptoVersion: {
            type: Number,
            default: 1
        },

        // -----------------------------
        // Timestamps
        // -----------------------------


        createdAt: {
            type: Date,
            default: Date.now
        },

        acceptedAt: {
            type: Date,
        },

        updatedAt: {
            type: Date,
        },

        revokedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const Friendship = mongoose.model(
    "Friendship",
    memberSchema
);