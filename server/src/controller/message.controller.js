import {
    createMessage,
    getMessages,
    getMessageById,
    deleteMessage,
    getChatContacts,
} from "../services/message.service.js";

import logger from "../utils/logger.js";


// ==================================================
// CREATE MESSAGE
// ==================================================

export const createMessageHandler = async (
    req,
    res
) => {

    const userId =
        req.user?._id ||
        req.user?.id;

    try {

        if (!userId) {

            logger.warn(
                "Message creation attempted without authentication",
                {
                    action: "create_message",
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const {
            friendshipId,
            groupId,
            ciphertext,
            nonce,
            authTag,
            messageType = "text",
            keyVersion = 1,
            cryptoVersion = 1,
        } = req.body;


        const message =
            await createMessage({
                userId,
                friendshipId,
                groupId,
                ciphertext,
                nonce,
                authTag,
                messageType,
                keyVersion,
                cryptoVersion,
            });


        logger.info(
            "Encrypted message stored",
            {
                action: "create_message",
                messageId: message._id,
                userId,
                friendshipId:
                    friendshipId || null,
                groupId:
                    groupId || null,
                keyVersion,
                cryptoVersion,
                messageType,
                ip: req.ip,
            }
        );


        return res.status(201).json({
            message: "Encrypted message stored",
            data: message,
        });

    } catch (err) {

        logger.error(
            "Failed to store encrypted message",
            {
                action: "create_message",
                userId,
                friendshipId:
                    req.body?.friendshipId ||
                    null,
                groupId:
                    req.body?.groupId ||
                    null,
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
// GET MESSAGES
// ==================================================

export const getMessagesHandler = async (
    req,
    res
) => {

    const userId =
        req.user?._id ||
        req.user?.id;

    try {

        if (!userId) {

            logger.warn(
                "Message retrieval attempted without authentication",
                {
                    action: "get_messages",
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const {
            friendshipId,
            groupId,
            page = 1,
            limit = 50,
        } = req.query;


        const result =
            await getMessages({
                userId,
                friendshipId,
                groupId,
                page,
                limit,
            });


        logger.info(
            "Encrypted messages retrieved",
            {
                action: "get_messages",
                userId,
                friendshipId:
                    friendshipId || null,
                groupId:
                    groupId || null,
                page:
                    result.pagination.page,
                limit:
                    result.pagination.limit,
                returned:
                    result.messages.length,
                ip: req.ip,
            }
        );


        return res.status(200).json(
            result
        );

    } catch (err) {

        logger.error(
            "Failed to retrieve encrypted messages",
            {
                action: "get_messages",
                userId,
                friendshipId:
                    req.query?.friendshipId ||
                    null,
                groupId:
                    req.query?.groupId ||
                    null,
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
// GET SINGLE MESSAGE
// ==================================================

export const getMessageByIdHandler = async (
    req,
    res
) => {

    const userId =
        req.user?._id ||
        req.user?.id;

    try {

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const { messageId } =
            req.params;


        const message =
            await getMessageById({
                userId,
                messageId,
            });


        logger.info(
            "Encrypted message retrieved by ID",
            {
                action: "get_message_by_id",
                userId,
                messageId,
                ip: req.ip,
            }
        );


        return res.status(200).json({
            message,
        });

    } catch (err) {

        logger.error(
            "Failed to retrieve message",
            {
                action: "get_message_by_id",
                userId,
                messageId:
                    req.params.messageId,
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
// DELETE MESSAGE
// ==================================================

export const deleteMessageHandler = async (
    req,
    res
) => {

    const userId =
        req.user?._id ||
        req.user?.id;

    try {

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const { messageId } =
            req.params;


        const message =
            await deleteMessage({
                userId,
                messageId,
            });


        logger.info(
            "Message soft-deleted",
            {
                action: "delete_message",
                userId,
                messageId,
                deletedAt:
                    message.deletedAt,
                ip: req.ip,
            }
        );


        return res.status(200).json({
            message:
                "Message deleted successfully",
            data: {
                _id: message._id,
                deletedAt:
                    message.deletedAt,
            },
        });

    } catch (err) {

        logger.error(
            "Failed to delete message",
            {
                action: "delete_message",
                userId,
                messageId:
                    req.params.messageId,
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
// GET CHAT CONTACTS
// ==================================================

export const getChatContactsHandler = async (
    req,
    res
) => {

    const userId =
        req.user?._id ||
        req.user?.id;

    try {

        if (!userId) {

            logger.warn(
                "Chat contacts fetch attempted without authentication",
                {
                    action: "get_chat_contacts",
                    ip: req.ip,
                }
            );

            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const { friends, groups } =
            await getChatContacts(userId);


        logger.info(
            "Chat contacts fetched",
            {
                action: "get_chat_contacts",
                userId,
                friendCount: friends.length,
                groupCount: groups.length,
                ip: req.ip,
            }
        );


        return res.status(200).json({
            message: "Chat contacts fetched",
            friends,
            groups,
        });

    } catch (err) {

        logger.error(
            "Failed to fetch chat contacts",
            {
                action: "get_chat_contacts",
                userId,
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