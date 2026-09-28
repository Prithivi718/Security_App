import express from "express";

import {
    sendFriendRequestHandler,
    acceptFriendRequestHandler,
    getPendingFriendRequestsHandler,
    setSharedSecretHandler,
    resetSharedSecretHandler,
    verifyFriendshipSecretHandler,
} from "../controller/friendship.controller.js";

import { authUser } from "../middleware/auth.middleware.js";

import {
    validateObjectId,
} from "../middleware/objectId.middleware.js";


const router = express.Router();


// ==================================================
// SEND FRIEND REQUEST
// ==================================================

router.post(
    "/request",
    authUser,
    sendFriendRequestHandler
);


// ==================================================
// GET PENDING FRIEND REQUESTS
// ==================================================

router.get(
    "/pending",
    authUser,
    getPendingFriendRequestsHandler
);


// ==================================================
// ACCEPT FRIEND REQUEST
// ==================================================

router.patch(
    "/:friendshipId/accept",
    authUser,
    validateObjectId("friendshipId"),
    acceptFriendRequestHandler
);


// ==================================================
// ESTABLISH SHARED SECRET
// ==================================================

router.post(
    "/:friendshipId/secret",
    authUser,
    validateObjectId("friendshipId"),
    setSharedSecretHandler
);


// ==================================================
// RESET SHARED SECRET
// ==================================================

router.delete(
    "/:friendshipId/secret",
    authUser,
    validateObjectId("friendshipId"),
    resetSharedSecretHandler
);


// ==================================================
// VERIFY SHARED SECRET
// ==================================================

router.post(
    "/:friendshipId/secret/verify",
    authUser,
    validateObjectId("friendshipId"),
    verifyFriendshipSecretHandler
);


export default router;