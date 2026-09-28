import express from "express";

import {
    getUserByIdHandler,
    searchUsersHandler,
    getUserByEmailHandler
} from "../controller/auth.controller.js";

import { authUser } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();


// ==================================================
// USER DISCOVERY
// ==================================================

// Search users for friend/member requests
router.get(
    "/search",
    authUser,
    searchUsersHandler
);


// Get user by ID
router.get(
    "/:userId",
    authUser,
    getUserByIdHandler
);


// Get user by email
router.get(
    "/email/:emailId",
    authUser,
    getUserByEmailHandler
);


export default router;