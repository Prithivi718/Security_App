import {
    createFriendshipChatSession,
    createGroupChatSession,
    validateChatSession,
    revokeChatSession,
} from "../services/chatSession.service.js";

import logger from "../utils/logger.js";


// ==================================================
// CREATE FRIENDSHIP CHAT SESSION
// ==================================================

export const createFriendshipChatSessionHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { friendshipId } = req.params;

        const { secretCode } = req.body;


        if (!userId) {

            logger.warn(
                "Chat session creation attempted without authentication",
                {
                    action: "create_friendship_chat_session",
                    friendshipId,
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!secretCode) {

            logger.warn(
                "Friendship chat session requested without secret",
                {
                    action: "create_friendship_chat_session",
                    userId,
                    friendshipId,
                    ip: req.ip,
                }
            );

            return res.status(400).json({
                message: "secretCode is required",
            });
        }


        const { session, kdfSalt } =
            await createFriendshipChatSession({
                userId,
                friendshipId,
                secretCode,
            });


        logger.info(
            "Friendship chat session created",
            {
                action: "create_friendship_chat_session",
                userId,
                friendshipId,
                sessionId: session._id,
                expiresAt: session.expiresAt,
                ip: req.ip,
            }
        );


        return res.status(201).json({
            message: "Secure chat unlocked",
            session: {
                sessionId: session._id,
                friendshipId: session.friendshipId,
                status: session.status,
                expiresAt: session.expiresAt,
            },
            kdf: {
                salt: kdfSalt,
                info: "SecureNet/chat/v1",
            },
            keyVersion: 1,
            cryptoVersion: 1,
        });

    } catch (err) {

        logger.error(
            "Failed to create friendship chat session",
            {
                action: "create_friendship_chat_session",
                userId:
                    req.user?._id ||
                    req.user?.id,
                friendshipId:
                    req.params.friendshipId,
                error: err.message,
                stack: err.stack,
                ip: req.ip,
            }
        );


        return res.status(
            err.statusCode || 500
        ).json({
            message:
                err.message ||
                "Internal server error",
        });
    }
};


// ==================================================
// CREATE GROUP CHAT SESSION
// ==================================================

export const createGroupChatSessionHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { groupId } = req.params;

        const { secretCode } = req.body;


        if (!userId) {

            logger.warn(
                "Group chat session creation attempted without authentication",
                {
                    action: "create_group_chat_session",
                    groupId,
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!secretCode) {

            logger.warn(
                "Group chat session requested without secret",
                {
                    action: "create_group_chat_session",
                    userId,
                    groupId,
                    ip: req.ip,
                }
            );

            return res.status(400).json({
                message: "secretCode is required",
            });
        }


        const { session, kdfSalt } =
            await createGroupChatSession({
                userId,
                groupId,
                secretCode,
            });


        logger.info(
            "Group chat session created",
            {
                action: "create_group_chat_session",
                userId,
                groupId,
                sessionId: session._id,
                expiresAt: session.expiresAt,
                ip: req.ip,
            }
        );


        return res.status(201).json({
            message: "Secure group chat unlocked",
            session: {
                sessionId: session._id,
                groupId: session.groupId,
                status: session.status,
                expiresAt: session.expiresAt,
            },
            kdf: {
                salt: kdfSalt,
                info: "SecureNet/chat/v1",
            },
            keyVersion: 1,
            cryptoVersion: 1,
        });

    } catch (err) {

        logger.error(
            "Failed to create group chat session",
            {
                action: "create_group_chat_session",
                userId:
                    req.user?._id ||
                    req.user?.id,
                groupId:
                    req.params.groupId,
                error: err.message,
                stack: err.stack,
                ip: req.ip,
            }
        );


        return res.status(
            err.statusCode || 500
        ).json({
            message:
                err.message ||
                "Internal server error",
        });
    }
};


// ==================================================
// VALIDATE CHAT SESSION
// ==================================================

export const validateChatSessionHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { sessionId } = req.params;


        if (!userId) {

            logger.warn(
                "Chat session validation attempted without authentication",
                {
                    action: "validate_chat_session",
                    sessionId,
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const session =
            await validateChatSession({
                sessionId,
                userId,
            });


        logger.info(
            "Chat session validated",
            {
                action: "validate_chat_session",
                userId,
                sessionId,
                status: session.status,
                expiresAt: session.expiresAt,
                ip: req.ip,
            }
        );


        return res.status(200).json({
            message: "Chat session is valid",
            session: {
                sessionId: session._id,
                friendshipId:
                    session.friendshipId,
                groupId:
                    session.groupId,
                status: session.status,
                expiresAt: session.expiresAt,
            },
        });

    } catch (err) {

        logger.error(
            "Chat session validation failed",
            {
                action: "validate_chat_session",
                userId:
                    req.user?._id ||
                    req.user?.id,
                sessionId:
                    req.params.sessionId,
                error: err.message,
                stack: err.stack,
                ip: req.ip,
            }
        );


        return res.status(
            err.statusCode || 500
        ).json({
            message:
                err.message ||
                "Internal server error",
        });
    }
};


// ==================================================
// REVOKE CHAT SESSION
// ==================================================

export const revokeChatSessionHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { sessionId } = req.params;


        if (!userId) {

            logger.warn(
                "Chat session revocation attempted without authentication",
                {
                    action: "revoke_chat_session",
                    sessionId,
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const session =
            await revokeChatSession({
                sessionId,
                userId,
            });


        logger.info(
            "Chat session revoked",
            {
                action: "revoke_chat_session",
                userId,
                sessionId,
                revokedAt: session.revokedAt,
                ip: req.ip,
            }
        );


        return res.status(200).json({
            message: "Chat session revoked successfully",
            session: {
                sessionId: session._id,
                status: session.status,
                revokedAt: session.revokedAt,
            },
        });

    } catch (err) {

        logger.error(
            "Failed to revoke chat session",
            {
                action: "revoke_chat_session",
                userId:
                    req.user?._id ||
                    req.user?.id,
                sessionId:
                    req.params.sessionId,
                error: err.message,
                stack: err.stack,
                ip: req.ip,
            }
        );


        return res.status(
            err.statusCode || 500
        ).json({
            message:
                err.message ||
                "Internal server error",
        });
    }
};