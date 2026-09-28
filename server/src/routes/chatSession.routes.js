import express from "express";

import {
    createFriendshipChatSessionHandler,
    createGroupChatSessionHandler,
    validateChatSessionHandler,
    revokeChatSessionHandler,
} from "../controller/chatSession.controller.js";

import {
    authUser,
} from "../middleware/auth.middleware.js";

import {
    validateObjectId,
} from "../middleware/objectId.middleware.js";


const router = express.Router();


// ==================================================
// UNLOCK FRIENDSHIP CHAT
// ==================================================

router.post(
    "/member/:friendshipId/unlock",
    authUser,
    validateObjectId("friendshipId"),
    createFriendshipChatSessionHandler
);


// ==================================================
// UNLOCK GROUP CHAT
// ==================================================

router.post(
    "/group/:groupId/unlock",
    authUser,
    validateObjectId("groupId"),
    createGroupChatSessionHandler
);


// ==================================================
// VALIDATE CHAT SESSION
// ==================================================

router.get(
    "/:sessionId/validate",
    authUser,
    validateObjectId("sessionId"),
    validateChatSessionHandler
);


// ==================================================
// REVOKE CHAT SESSION
// ==================================================

router.delete(
    "/:sessionId",
    authUser,
    validateObjectId("sessionId"),
    revokeChatSessionHandler
);


export default router;