import express from "express";

import {
    registerUser,
    verifyOTP,
    resendOtpHandler,
    loginUser,
    requestPasswordReset,
    validateResetTokenHandler,
    confirmPasswordReset,
    logout,
    getCurrentUserHandler,
    updateProfileHandler,
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

router.post("/reset-password/validate", validateResetTokenHandler);

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

router.patch(
    "/profile",
    authUser,
    updateProfileHandler
);



export default router;