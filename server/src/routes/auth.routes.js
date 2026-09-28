import express from "express";

import {
    registerUser,
    verifyOTP,
    resendOtpHandler,
    loginUser,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    getCurrentUserHandler,
} from "../controller/auth.controller.js";

import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();


// ==================================================
// PUBLIC AUTH ROUTES
// ==================================================

router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOtpHandler);

router.post("/login", loginUser);

router.post("/forgot-password", requestPasswordReset);

router.post("/reset-password", confirmPasswordReset);


// ==================================================
// AUTHENTICATED USER ROUTES
// ==================================================

router.post(
    "/logout",
    authUser,
    logout
);

router.get(
    "/me",
    authUser,
    getCurrentUserHandler
);



export default router;