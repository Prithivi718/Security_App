import {
    createGroup,
    getGroupById,
    addGroupMember,
    removeGroupMember,
    leaveGroup,
    updateGroupMemberRole,
    archiveGroup,
} from "../services/group.service.js";

import {
    sanitizeGroup,
} from "../utils/helper.js";
import logger from "../utils/logger.js";


// ==================================================
// CREATE GROUP
// ==================================================

export const createGroupHandler = async (
    req,
    res
) => {

    try {

        const createdBy =
            req.user?._id || req.user?.id;

        const {
            name,
            memberIds,
            secretCode,
        } = req.body;


        if (!createdBy) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!name || !secretCode) {
            return res.status(400).json({
                message:
                    "name and secretCode are required",
            });
        }


        const group = await createGroup({
            name,
            createdBy,
            memberIds,
            secretCode,
        });


        return res.status(201).json({
            message: "Group created successfully",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Create group error:",
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
// GET GROUP
// ==================================================

export const getGroupHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { groupId } = req.params;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const group =
            await getGroupById({
                groupId,
                userId,
            });


        return res.status(200).json({
            group,
        });

    } catch (err) {

        logger.error(
            "Get group error:",
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
// ADD MEMBER
// ==================================================

export const addGroupMemberHandler = async (
    req,
    res
) => {

    try {

        const actorUserId =
            req.user?._id || req.user?.id;

        const { groupId } = req.params;

        const { newUserId } = req.body;


        if (!actorUserId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!newUserId) {
            return res.status(400).json({
                message: "newUserId is required",
            });
        }


        const group =
            await addGroupMember({
                groupId,
                actorUserId,
                newUserId,
            });


        return res.status(200).json({
            message: "Member added successfully",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Add group member error:",
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
// REMOVE MEMBER
// ==================================================

export const removeGroupMemberHandler = async (
    req,
    res
) => {

    try {

        const actorUserId =
            req.user?._id || req.user?.id;

        const {
            groupId,
            targetUserId,
        } = req.params;


        if (!actorUserId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const group =
            await removeGroupMember({
                groupId,
                actorUserId,
                targetUserId,
            });


        return res.status(200).json({
            message: "Member removed successfully",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Remove group member error:",
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
// LEAVE GROUP
// ==================================================

export const leaveGroupHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { groupId } = req.params;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const group =
            await leaveGroup({
                groupId,
                userId,
            });


        return res.status(200).json({
            message: "You left the group",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Leave group error:",
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
// UPDATE MEMBER ROLE
// ==================================================

export const updateGroupMemberRoleHandler = async (
    req,
    res
) => {

    try {

        const actorUserId =
            req.user?._id || req.user?.id;

        const {
            groupId,
            targetUserId,
        } = req.params;

        const { role } = req.body;


        if (!actorUserId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        if (!role) {
            return res.status(400).json({
                message: "role is required",
            });
        }


        const group =
            await updateGroupMemberRole({
                groupId,
                actorUserId,
                targetUserId,
                role,
            });


        return res.status(200).json({
            message: "Member role updated successfully",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Update group member role error:",
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
// ARCHIVE GROUP
// ==================================================

export const archiveGroupHandler = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id || req.user?.id;

        const { groupId } = req.params;


        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }


        const group =
            await archiveGroup({
                groupId,
                userId,
            });


        return res.status(200).json({
            message: "Group archived successfully",
            group: sanitizeGroup(group),
        });

    } catch (err) {

        logger.error(
            "Archive group error:",
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