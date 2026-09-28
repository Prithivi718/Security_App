import express from "express";

import {
    createGroupHandler,
    getGroupHandler,
    addGroupMemberHandler,
    removeGroupMemberHandler,
    leaveGroupHandler,
    updateGroupMemberRoleHandler,
    archiveGroupHandler,
} from "../controller/group.controller.js";

import { authUser } from "../middleware/auth.middleware.js";

import {
    validateObjectId,
} from "../middleware/objectId.middleware.js";


const router = express.Router();


// ==================================================
// CREATE GROUP
// ==================================================

router.post(
    "/create",
    authUser,
    createGroupHandler
);


// ==================================================
// GET GROUP
// ==================================================

router.get(
    "/:groupId",
    authUser,
    validateObjectId("groupId"),
    getGroupHandler
);


// ==================================================
// ADD MEMBER
// ==================================================

router.post(
    "/:groupId/members",
    authUser,
    validateObjectId("groupId"),
    addGroupMemberHandler
);


// ==================================================
// REMOVE MEMBER
// ==================================================

router.delete(
    "/:groupId/members/:targetUserId",
    authUser,
    validateObjectId("groupId"),
    validateObjectId("targetUserId"),
    removeGroupMemberHandler
);


// ==================================================
// LEAVE GROUP
// ==================================================

router.post(
    "/:groupId/leave",
    authUser,
    validateObjectId("groupId"),
    leaveGroupHandler
);


// ==================================================
// UPDATE MEMBER ROLE
// ==================================================

router.patch(
    "/:groupId/members/:targetUserId/role",
    authUser,
    validateObjectId("groupId"),
    validateObjectId("targetUserId"),
    updateGroupMemberRoleHandler
);


// ==================================================
// ARCHIVE GROUP
// ==================================================

router.patch(
    "/:groupId/archive",
    authUser,
    validateObjectId("groupId"),
    archiveGroupHandler
);


export default router;