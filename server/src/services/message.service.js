import mongoose from "mongoose";

import Message from "../models/message/message.model.js";
import ChatSession from "../models/message/chatSession.model.js";
import { Friendship } from "../models/friend/member.model.js";
import Group from "../models/group/group.model.js";


// ==================================================
// CONSTANTS
// ==================================================

const SUPPORTED_CRYPTO_VERSION = 1;
const SUPPORTED_KEY_VERSION = 1;

const ALLOWED_MESSAGE_TYPES = [
    "text",
    "image",
    "file",
    "system",
];


// ==================================================
// HELPERS
// ==================================================

const createServiceError = (
    message,
    statusCode = 500
) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};


const validateObjectId = (
    value,
    fieldName
) => {

    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw createServiceError(
            `Invalid ${fieldName}`,
            400
        );
    }
};


// ==================================================
// VALIDATE ACTIVE FRIENDSHIP SESSION
// ==================================================

const validateFriendshipAccess = async ({
    userId,
    friendshipId,
}) => {

    const friendship =
        await Friendship.findById(friendshipId);

    if (!friendship) {
        throw createServiceError(
            "Friendship not found",
            404
        );
    }


    if (friendship.status !== "accepted") {
        throw createServiceError(
            "Friendship is not active",
            403
        );
    }


    const isParticipant =
        friendship.userAId.toString() ===
            userId.toString() ||
        friendship.userBId.toString() ===
            userId.toString();


    if (!isParticipant) {
        throw createServiceError(
            "You are not a participant of this friendship",
            403
        );
    }


    const session =
        await ChatSession.findOne({
            userId,
            friendshipId,
            status: "active",
            expiresAt: {
                $gt: new Date(),
            },
        }).sort({
            createdAt: -1,
        });


    if (!session) {
        throw createServiceError(
            "Secure chat session is missing or expired",
            401
        );
    }


    return {
        friendship,
        session,
    };
};


// ==================================================
// VALIDATE ACTIVE GROUP SESSION
// ==================================================

const validateGroupAccess = async ({
    userId,
    groupId,
}) => {

    const group =
        await Group.findById(groupId);

    if (!group) {
        throw createServiceError(
            "Group not found",
            404
        );
    }


    if (group.status !== "active") {
        throw createServiceError(
            "Group is not active",
            403
        );
    }


    const member =
        group.members.find(
            (member) =>
                member.userId.toString() ===
                    userId.toString() &&
                member.status === "active"
        );


    if (!member) {
        throw createServiceError(
            "You are not an active member of this group",
            403
        );
    }


    const session =
        await ChatSession.findOne({
            userId,
            groupId,
            status: "active",
            expiresAt: {
                $gt: new Date(),
            },
        }).sort({
            createdAt: -1,
        });


    if (!session) {
        throw createServiceError(
            "Secure group chat session is missing or expired",
            401
        );
    }


    return {
        group,
        member,
        session,
    };
};


// ==================================================
// VALIDATE MESSAGE PAYLOAD
// ==================================================

const validateEncryptedPayload = ({
    friendshipId,
    groupId,
    ciphertext,
    nonce,
    authTag,
    messageType,
    keyVersion,
    cryptoVersion,
}) => {

    const hasFriendship = !!friendshipId;
    const hasGroup = !!groupId;


    if (hasFriendship === hasGroup) {
        throw createServiceError(
            "Exactly one of friendshipId or groupId is required",
            400
        );
    }


    if (
        !ciphertext ||
        typeof ciphertext !== "string"
    ) {
        throw createServiceError(
            "ciphertext is required",
            400
        );
    }


    if (
        !nonce ||
        typeof nonce !== "string"
    ) {
        throw createServiceError(
            "nonce is required",
            400
        );
    }


    if (
        !authTag ||
        typeof authTag !== "string"
    ) {
        throw createServiceError(
            "authTag is required",
            400
        );
    }


    if (
        !ALLOWED_MESSAGE_TYPES.includes(
            messageType
        )
    ) {
        throw createServiceError(
            "Invalid message type",
            400
        );
    }


    if (
        keyVersion !== SUPPORTED_KEY_VERSION
    ) {
        throw createServiceError(
            `Unsupported key version: ${keyVersion}`,
            400
        );
    }


    if (
        cryptoVersion !==
        SUPPORTED_CRYPTO_VERSION
    ) {
        throw createServiceError(
            `Unsupported crypto version: ${cryptoVersion}`,
            400
        );
    }
};


// ==================================================
// CREATE MESSAGE
// ==================================================

export const createMessage = async ({
    userId,
    friendshipId,
    groupId,
    ciphertext,
    nonce,
    authTag,
    messageType = "text",
    keyVersion = 1,
    cryptoVersion = 1,
}) => {

    validateEncryptedPayload({
        friendshipId,
        groupId,
        ciphertext,
        nonce,
        authTag,
        messageType,
        keyVersion,
        cryptoVersion,
    });


    if (friendshipId) {
        validateObjectId(
            friendshipId,
            "friendshipId"
        );
    }

    if (groupId) {
        validateObjectId(
            groupId,
            "groupId"
        );
    }


    let conversation;


    // ----------------------------------------------
    // Friendship message
    // ----------------------------------------------

    if (friendshipId) {

        const result =
            await validateFriendshipAccess({
                userId,
                friendshipId,
            });

        conversation =
            result.friendship;
    }


    // ----------------------------------------------
    // Group message
    // ----------------------------------------------

    if (groupId) {

        const result =
            await validateGroupAccess({
                userId,
                groupId,
            });

        conversation =
            result.group;
    }


    // ----------------------------------------------
    // Persist ONLY encrypted data
    // ----------------------------------------------

    const message =
        await Message.create({
            friendshipId:
                friendshipId || null,

            groupId:
                groupId || null,

            senderId: userId,

            ciphertext,

            nonce,

            authTag,

            keyVersion,

            cryptoVersion,

            messageType,
        });


    return message;
};


// --------------------------------------------------
// Chat interface
// --------------------------------------------------

export const getChatContacts = async (userId) => {

    const friendships = await Friendship.find({
        status: "accepted",
        $or: [
            { userAId: userId },
            { userBId: userId }
        ]
    })
        .populate({
            path: "userAId",
            select: "_id userName emailId"
        })
        .populate({
            path: "userBId",
            select: "_id userName emailId"
        })
        .sort({ updatedAt: -1 });


    const friends = friendships.map((friendship) => {

        const friend =
            friendship.userAId._id.toString() === userId.toString()
                ? friendship.userBId
                : friendship.userAId;

        return {
            friendshipId: friendship._id,
            user: friend,
            updatedAt: friendship.updatedAt
        };
    });


    const groups = await Group.find({
        "members": {
            $elemMatch: {
                userId: userId,
                status: "active"
            }
        },
        status: "active"
    })
        .select("_id name members updatedAt")
        .sort({ updatedAt: -1 });


    return {
        friends,
        groups
    };
};


// ==================================================
// GET MESSAGES
// ==================================================

export const getMessages = async ({
    userId,
    friendshipId,
    groupId,
    page = 1,
    limit = 50,
}) => {

    const hasFriendship = !!friendshipId;
    const hasGroup = !!groupId;


    if (hasFriendship === hasGroup) {
        throw createServiceError(
            "Exactly one of friendshipId or groupId is required",
            400
        );
    }


    if (friendshipId) {

        validateObjectId(
            friendshipId,
            "friendshipId"
        );


        await validateFriendshipAccess({
            userId,
            friendshipId,
        });
    }


    if (groupId) {

        validateObjectId(
            groupId,
            "groupId"
        );


        await validateGroupAccess({
            userId,
            groupId,
        });
    }


    page = Math.max(
        Number.parseInt(page, 10) || 1,
        1
    );

    limit = Math.min(
        Math.max(
            Number.parseInt(limit, 10) || 50,
            1
        ),
        100
    );


    const skip =
        (page - 1) * limit;


    const query = {
        deletedAt: null,
    };


    if (friendshipId) {
        query.friendshipId = friendshipId;
    }


    if (groupId) {
        query.groupId = groupId;
    }


    const [
        messages,
        total,
    ] = await Promise.all([
        Message.find(query)
            .select(
                "_id friendshipId groupId senderId " +
                "ciphertext nonce authTag " +
                "keyVersion cryptoVersion " +
                "messageType createdAt updatedAt"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Message.countDocuments(query),
    ]);


    return {
        messages,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),

            hasNextPage:
                skip + messages.length <
                total,
        },
    };
};




// ==================================================
// GET SINGLE MESSAGE
// ==================================================

export const getMessageById = async ({
    userId,
    messageId,
}) => {

    validateObjectId(
        messageId,
        "messageId"
    );


    const message =
        await Message.findOne({
            _id: messageId,
            deletedAt: null,
        });


    if (!message) {
        throw createServiceError(
            "Message not found",
            404
        );
    }


    if (message.friendshipId) {

        await validateFriendshipAccess({
            userId,
            friendshipId:
                message.friendshipId,
        });
    }


    if (message.groupId) {

        await validateGroupAccess({
            userId,
            groupId:
                message.groupId,
        });
    }


    return message;
};


// ==================================================
// DELETE MESSAGE
// ==================================================

export const deleteMessage = async ({
    userId,
    messageId,
}) => {

    validateObjectId(
        messageId,
        "messageId"
    );


    const message =
        await Message.findById(
            messageId
        );


    if (!message) {
        throw createServiceError(
            "Message not found",
            404
        );
    }


    // ----------------------------------------------
    // Validate chat authorization
    // ----------------------------------------------

    if (message.friendshipId) {

        await validateFriendshipAccess({
            userId,
            friendshipId:
                message.friendshipId,
        });
    }


    if (message.groupId) {

        await validateGroupAccess({
            userId,
            groupId:
                message.groupId,
        });
    }


    // ----------------------------------------------
    // Only sender can delete for now
    // ----------------------------------------------

    if (
        message.senderId.toString() !==
        userId.toString()
    ) {
        throw createServiceError(
            "Only the message sender can delete this message",
            403
        );
    }


    if (message.deletedAt) {
        throw createServiceError(
            "Message is already deleted",
            409
        );
    }


    message.deletedAt = new Date();

    await message.save();


    return message;
};