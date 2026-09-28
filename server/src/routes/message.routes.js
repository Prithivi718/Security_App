import express from "express";

import {
    createMessageHandler,
    getMessagesHandler,
    getMessageByIdHandler,
    deleteMessageHandler,
    getChatContactsHandler,
} from "../controller/message.controller.js";

import {
    authUser,
} from "../middleware/auth.middleware.js";

import {
    validateObjectId,
} from "../middleware/objectId.middleware.js";


const router = express.Router();


// ==================================================
// CREATE ENCRYPTED MESSAGE
// ==================================================

router.post(
    "/",
    authUser,
    createMessageHandler
);


// ==================================================
// GET ENCRYPTED MESSAGES
// ==================================================

router.get(
    "/",
    authUser,
    getMessagesHandler
);


// ==================================================
// GET CHAT CONTACTS
// ==================================================

router.get(
    "/contacts",
    authUser,
    getChatContactsHandler
);


// ==================================================
// GET SINGLE ENCRYPTED MESSAGE
// ==================================================

router.get(
    "/:messageId",
    authUser,
    validateObjectId("messageId"),
    getMessageByIdHandler
);


// ==================================================
// SOFT DELETE MESSAGE
// ==================================================

router.delete(
    "/:messageId",
    authUser,
    validateObjectId("messageId"),
    deleteMessageHandler
);


export default router;