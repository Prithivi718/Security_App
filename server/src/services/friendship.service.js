// services/friendship.service.js

import { Friendship } from "../models/friend/member.model.js";
import {
    createSecretVerifier,
    verifySecret,
} from "./crypto.service.js";


// --------------------------------------------------
// SEND FRIEND REQUEST
// --------------------------------------------------

export const sendFriendRequest = async (
    requesterId,
    receiverId
) => {

    if (requesterId.toString() === receiverId.toString()) {
        throw new Error(
            "You cannot send a request to yourself"
        );
    }

    // Check whether a relationship already exists
    const existing = await Friendship.findOne({
        $or: [
            {
                userAId: requesterId,
                userBId: receiverId,
            },
            {
                userAId: receiverId,
                userBId: requesterId,
            },
        ],
    });

    if (existing) {
        throw new Error(
            "Friendship already exists or is pending"
        );
    }

    const friendship = await Friendship.create({
        userAId: requesterId,
        userBId: receiverId,
        requestedBy: requesterId,
        status: "pending",
    });

    return friendship;
};


// --------------------------------------------------
// ACCEPT FRIEND REQUEST
// --------------------------------------------------

export const acceptFriendRequest = async (
    friendshipId,
    acceptingUserId
) => {

    const friendship = await Friendship.findById(
        friendshipId
    );

    if (!friendship) {
        throw new Error(
            "Friend request not found"
        );
    }

    if (friendship.status !== "pending") {
        throw new Error(
            "Friend request is not pending"
        );
    }

    // Only the receiver can accept it
    if (
        friendship.requestedBy.toString() ===
        acceptingUserId.toString()
    ) {
        throw new Error(
            "Requester cannot accept their own request"
        );
    }

    // Make sure accepting user is actually userB
    if (
        friendship.userBId.toString() !==
        acceptingUserId.toString()
    ) {
        throw new Error(
            "You are not authorized to accept this request"
        );
    }

    friendship.status = "accepted";
    friendship.acceptedAt = new Date();

    await friendship.save();

    return friendship;
};

// --------------------------------------------------
// Get Follow Requests
// --------------------------------------------------

export const getPendingFriendRequests = async (userId) => {

    const invitations = await Friendship.find({
        status: "pending",
        requestedBy: { $ne: userId },
        $or: [
            { userAId: userId },
            { userBId: userId }
        ]
    })
        .populate({
            path: "requestedBy",
            select: "_id userName emailId"
        })
        .sort({ createdAt: -1 });


    const sent = await Friendship.find({
        status: "pending",
        requestedBy: userId
    })
        .populate({
            path: "userAId",
            select: "_id userName emailId"
        })
        .populate({
            path: "userBId",
            select: "_id userName emailId"
        })
        .sort({ createdAt: -1 });


    return {
        invitations,
        sent
    };
};

// --------------------------------------------------
// SET SHARED SECRET
// --------------------------------------------------

export const setSharedSecret = async (
    friendshipId,
    userId,
    secretCode
) => {

    const friendship = await Friendship.findById(
        friendshipId
    ).select(
        "+secretVerifier +secretSalt +kdfSalt"
    );

    if (!friendship) {
        throw new Error(
            "Friendship not found"
        );
    }

    if (friendship.status !== "accepted") {
        throw new Error(
            "Friendship is not accepted"
        );
    }

    // Only participants can establish the secret
    const isParticipant =
        friendship.userAId.toString() === userId.toString() ||
        friendship.userBId.toString() === userId.toString();

    if (!isParticipant) {
        throw new Error(
            "You are not a participant of this friendship"
        );
    }

    // Do not silently overwrite an existing secret
    if (friendship.secretVerifier) {
        throw new Error(
            "Shared secret has already been established"
        );
    }

    const {
        secretVerifier,
        kdfSalt,
        secretSalt,
    } = await createSecretVerifier(secretCode, friendship.kdfSalt);

    friendship.secretVerifier = secretVerifier;
    friendship.secretSalt = secretSalt;
    friendship.kdfSalt = kdfSalt;
    friendship.cryptoVersion = 1;

    await friendship.save();

    return friendship;
};

export const resetSharedSecret = async (friendshipId, userId) => {
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
        throw new Error("Friendship not found");
    }

    const isParticipant =
        friendship.userAId.toString() === userId.toString() ||
        friendship.userBId.toString() === userId.toString();

    if (!isParticipant) {
        throw new Error("You are not a participant of this friendship");
    }

    friendship.secretVerifier = null;
    friendship.secretSalt = null;
    friendship.cryptoVersion = 0;
    await friendship.save();

    return friendship;
};


// --------------------------------------------------
// VERIFY SHARED SECRET
// --------------------------------------------------

export const verifyFriendshipSecret = async (
    friendshipId,
    userId,
    secretCode
) => {

    const friendship = await Friendship.findById(
        friendshipId
    ).select(
        "+secretVerifier +secretSalt"
    );

    if (!friendship) {
        throw new Error(
            "Friendship not found"
        );
    }

    if (friendship.status !== "accepted") {
        throw new Error(
            "Friendship is not active"
        );
    }

    const isParticipant =
        friendship.userAId.toString() === userId.toString() ||
        friendship.userBId.toString() === userId.toString();

    if (!isParticipant) {
        throw new Error(
            "You are not authorized"
        );
    }

    if (
        !friendship.secretVerifier ||
        !friendship.secretSalt
    ) {
        throw new Error(
            "Shared secret has not been established"
        );
    }

    const valid = await verifySecret(
        secretCode,
        friendship.secretVerifier,
        friendship.secretSalt
    );

    return valid;
};