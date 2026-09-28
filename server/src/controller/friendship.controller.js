import {
    sendFriendRequest,
    acceptFriendRequest,
    getPendingFriendRequests,
    setSharedSecret,
    verifyFriendshipSecret,
} from "../services/friendship.service.js";

import {
    sanitizeFriendship,
} from "../utils/helper.js";
import logger from "../utils/logger.js";


// ==================================================
// SEND FRIEND REQUEST
// ==================================================

export const sendFriendRequestHandler = async (req, res) => {

    try {

        const requesterId =
            req.user?._id || req.user?.id;

        const { receiverId } = req.body;


        if (!requesterId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!receiverId) {
            return res.status(400).json({
                message: "receiverId is required",
            });
        }


        const friendship = await sendFriendRequest(
            requesterId,
            receiverId
        );


        return res.status(201).json({
            message: "Friend request sent successfully",
            friendship: sanitizeFriendship(friendship),
        });

    } catch (err) {

        logger.error(
            "Send friend request error:",
            err
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
// ACCEPT FRIEND REQUEST
// ==================================================

export const acceptFriendRequestHandler = async (
    req,
    res
) => {

    try {

        const acceptingUserId =
            req.user?._id || req.user?.id;

        const { friendshipId } = req.params;


        if (!acceptingUserId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const friendship =
            await acceptFriendRequest(
                friendshipId,
                acceptingUserId
            );


        return res.status(200).json({
            message: "Friend request accepted",
            friendship: sanitizeFriendship(friendship),
        });

    } catch (err) {

        logger.error(
            "Accept friend request error:",
            err
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
// GET PENDING FRIEND REQUESTS
// ==================================================

export const getPendingFriendRequestsHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const { invitations, sent } =
            await getPendingFriendRequests(userId);


        return res.status(200).json({
            message: "Pending friend requests fetched",
            invitations,
            sent,
        });

    } catch (err) {

        logger.error(
            "Get pending friend requests error:",
            err
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
// SET SHARED SECRET
// ==================================================

export const setSharedSecretHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { friendshipId } = req.params;

        const { secretCode } = req.body;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!secretCode) {
            return res.status(400).json({
                message: "secretCode is required",
            });
        }


        const friendship =
            await setSharedSecret(
                friendshipId,
                userId,
                secretCode
            );


        return res.status(200).json({
            message: "Shared secret established successfully",
            friendship: sanitizeFriendship(friendship),
        });

    } catch (err) {

        logger.error(
            "Set shared secret error:",
            err
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
// VERIFY SHARED SECRET
// ==================================================

export const verifyFriendshipSecretHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { friendshipId } = req.params;

        const { secretCode } = req.body;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!secretCode) {
            return res.status(400).json({
                message: "secretCode is required",
            });
        }


        const valid =
            await verifyFriendshipSecret(
                friendshipId,
                userId,
                secretCode
            );


        if (!valid) {
            return res.status(401).json({
                message: "Invalid shared secret",
                valid: false,
            });
        }


        return res.status(200).json({
            message: "Shared secret verified",
            valid: true,
        });

    } catch (err) {

        logger.error(
            "Verify friendship secret error:",
            err
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