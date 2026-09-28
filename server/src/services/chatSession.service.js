import ChatSession from "../models/message/chatSession.model.js";
import { Friendship } from "../models/friend/member.model.js";
import { verifySecret } from "./crypto.service.js";
import Group from "../models/group/group.model.js";

const CHAT_SESSION_DURATION_MS = 10 * 60 * 1000;


// ==================================================
// INTERNAL: Validate friendship access
// ==================================================

const getValidFriendship = async (
    friendshipId,
    userId
) => {

    const friendship = await Friendship.findById(
        friendshipId
    ).select(
        "+secretVerifier +secretSalt +kdfSalt"
    );

    if (!friendship) {
        const error = new Error(
            "Friendship not found"
        );

        error.statusCode = 404;
        throw error;
    }

    if (friendship.status !== "accepted") {
        const error = new Error(
            "Friendship is not accepted"
        );

        error.statusCode = 403;
        throw error;
    }

    const isParticipant =
        friendship.userAId.toString() === userId.toString() ||
        friendship.userBId.toString() === userId.toString();

    if (!isParticipant) {
        const error = new Error(
            "You are not a participant of this friendship"
        );

        error.statusCode = 403;
        throw error;
    }

    return friendship;
};


// ==================================================
// UNLOCK FRIENDSHIP CHAT
// ==================================================

export const createFriendshipChatSession = async ({
    userId,
    friendshipId,
    secretCode,
}) => {

    const friendship = await getValidFriendship(
        friendshipId,
        userId
    );

    if (
        !friendship.secretVerifier ||
        !friendship.secretSalt
    ) {
        const error = new Error(
            "Shared secret has not been established"
        );

        error.statusCode = 400;
        throw error;
    }


    // ----------------------------------------------
    // Verify shared secret
    // ----------------------------------------------

    const validSecret = await verifySecret(
        secretCode,
        friendship.secretVerifier,
        friendship.secretSalt
    );

    if (!validSecret) {
        const error = new Error(
            "Invalid shared secret"
        );

        error.statusCode = 401;
        throw error;
    }


    // ----------------------------------------------
    // Revoke previous active session
    // ----------------------------------------------

    await ChatSession.updateMany(
        {
            userId,
            friendshipId,
            status: "active",
        },
        {
            $set: {
                status: "revoked",
                revokedAt: new Date(),
            },
        }
    );


    // ----------------------------------------------
    // Create fixed 10-minute session
    // ----------------------------------------------

    const createdAt = new Date();

    const expiresAt = new Date(
        createdAt.getTime() +
        CHAT_SESSION_DURATION_MS
    );


    const session = await ChatSession.create({
        userId,
        friendshipId,

        status: "active",

        expiresAt,
    });

    return {
        session,
        kdfSalt: friendship.kdfSalt,
    };
};


// ==================================================
// INTERNAL: Validate group access
// ==================================================

const getValidGroup = async (
    groupId,
    userId
) => {

    const group = await Group.findById(
        groupId
    ).select(
        "+secretVerifier +secretSalt +kdfSalt"
    );

    if (!group) {
        const error = new Error(
            "Group not found"
        );

        error.statusCode = 404;
        throw error;
    }

    if (group.status !== "active") {
        const error = new Error(
            "Group is not active"
        );

        error.statusCode = 403;
        throw error;
    }


    const member = group.members.find(
        (member) =>
            member.userId.toString() === userId.toString() &&
            member.status === "active"
    );

    if (!member) {
        const error = new Error(
            "User is not an active member of this group"
        );

        error.statusCode = 403;
        throw error;
    }

    return group;
};


// ==================================================
// UNLOCK GROUP CHAT
// ==================================================

export const createGroupChatSession = async ({
    userId,
    groupId,
    secretCode,
}) => {

    const group = await getValidGroup(
        groupId,
        userId
    );


    if (
        !group.secretVerifier ||
        !group.secretSalt
    ) {
        const error = new Error(
            "Group shared secret has not been established"
        );

        error.statusCode = 400;
        throw error;
    }


    // ----------------------------------------------
    // Verify group secret
    // ----------------------------------------------

    const validSecret = await verifySecret(
        secretCode,
        group.secretVerifier,
        group.secretSalt
    );


    if (!validSecret) {
        const error = new Error(
            "Invalid group shared secret"
        );

        error.statusCode = 401;
        throw error;
    }


    // ----------------------------------------------
    // Revoke previous active session
    // ----------------------------------------------

    await ChatSession.updateMany(
        {
            userId,
            groupId,
            status: "active",
        },
        {
            $set: {
                status: "revoked",
                revokedAt: new Date(),
            },
        }
    );


    const createdAt = new Date();

    const expiresAt = new Date(
        createdAt.getTime() +
        CHAT_SESSION_DURATION_MS
    );


    const session = await ChatSession.create({
        userId,
        groupId,

        status: "active",

        expiresAt,
    });

    return {
        session,
        kdfSalt: group.kdfSalt,
    };
};


// ==================================================
// VALIDATE CHAT SESSION
// ==================================================

export const validateChatSession = async ({
    sessionId,
    userId,
}) => {

    const session = await ChatSession.findById(
        sessionId
    );

    if (!session) {
        const error = new Error(
            "Chat session not found"
        );

        error.statusCode = 404;
        throw error;
    }


    // Session belongs to another user
    if (
        session.userId.toString() !==
        userId.toString()
    ) {
        const error = new Error(
            "You are not authorized to use this session"
        );

        error.statusCode = 403;
        throw error;
    }


    // Already revoked
    if (session.status === "revoked") {
        const error = new Error(
            "Chat session has been revoked"
        );

        error.statusCode = 401;
        throw error;
    }


    // Check expiry
    if (
        session.expiresAt.getTime() <=
        Date.now()
    ) {

        session.status = "expired";

        await session.save();

        const error = new Error(
            "Chat session has expired"
        );

        error.statusCode = 401;
        throw error;
    }


    return session;
};


// ==================================================
// REVOKE SESSION
// ==================================================

export const revokeChatSession = async ({
    sessionId,
    userId,
}) => {

    const session = await ChatSession.findById(
        sessionId
    );

    if (!session) {
        const error = new Error(
            "Chat session not found"
        );

        error.statusCode = 404;
        throw error;
    }


    if (
        session.userId.toString() !==
        userId.toString()
    ) {
        const error = new Error(
            "You are not authorized to revoke this session"
        );

        error.statusCode = 403;
        throw error;
    }


    session.status = "revoked";
    session.revokedAt = new Date();

    await session.save();

    return session;
};