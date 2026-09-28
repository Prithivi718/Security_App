import express from "express";


import {
    updateUserRoleHandler,
    updateUserStatusHandler
} from "../controller/auth.controller.js"

import { authUser } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";


const router = express.Router();

// ==================================================
// ADMIN ROUTES
// ==================================================

// Update user's role
router.patch(
    "/users/role",
    authUser,
    requireRole("admin"),
    updateUserRoleHandler
);


// Update user's account status
router.patch(
    "/users/status",
    authUser,
    requireRole("admin"),
    updateUserStatusHandler
);


export default router;