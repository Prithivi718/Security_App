import {
    createUser,
    createSignupOtp,
    verifySignupOtp,
    authenticateUser,
    createPasswordResetToken,
    validateResetToken,
    resetPassword,
    logoutUser,
    getCurrentUser,
    searchUsers,
    updateUserRole,
    updateUserStatus,
    getUserById,
    getUserByEmail
} from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";
import { sendOtpEmail, transporter } from "../utils/nodeMailer.js";

import logger from "../utils/logger.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sendAuthSuccess = (res, user, payload = {}) => {
    const token = generateToken({
        userId: user._id,
        role: user.role,
        token_version: user.token_version ?? 0
    });

    res.cookie("auth_token", token, COOKIE_OPTIONS);

    const safeUser =
        typeof user.toJSON === "function" ? user.toJSON() : { ...user };

    return res.status(200).json({
        message: "Logged-in successfully",
        user: safeUser,
        ...payload,
    });
};

export const registerUser = async (req, res) => {
    try {
        const { userName, emailId, password } = req.body;

        // 1. Create the user
        const user = await createUser({ userName, emailId, password });

        // 2. Generate OTP for the newly created user
        const otp = await createSignupOtp(user._id);

        // 3. Send the OTP through email
        await sendOtpEmail(emailId, otp);

        return res.status(201).json({
            message: "User registered successfully. Please verify your email with the OTP sent.",
            user: { _id: user._id, userName: user.userName, emailId: user.emailId }
        });
    } catch (err) {
        logger.error("Register error:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || "field";
            return res.status(409).json({
                message: `${field} already in use`,
            });
        }
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { emailId, otp } = req.body;

        const user = await verifySignupOtp({ emailId, otp });

        return sendAuthSuccess(res, user, { message: "Email Verified successfully" });
    } catch (err) {
        logger.error("Verify-Otp error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const resendOtpHandler = async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await getUserByEmail(emailId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = await createSignupOtp(user._id);
        await sendOtpEmail(emailId, otp);

        return res.status(200).json({
            message: "A new OTP has been sent to your email."
        });
    } catch (err) {
        logger.error("Resend OTP error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await authenticateUser({ emailId, password });

        return sendAuthSuccess(res, user, { message: "Logged in successfully" });
    } catch (err) {
        logger.error("Login error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { emailId } = req.body;

        const result = await createPasswordResetToken(emailId);

        if (result) {
            await transporter.sendMail({
                from: process.env.APP_EMAIL,
                to: emailId,
                subject: "Password Reset Token",
                text: `Your password reset token is: ${result.rawToken}`
            });
        }

        return res.status(200).json({
            message: "If you have an account, a reset token was sent to your email."
        });
    } catch (err) {
        logger.error("Request Password Reset error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const validateResetTokenHandler = async (req, res) => {
    try {
        const { emailId, token } = req.body;

        await validateResetToken({ emailId, token });

        return res.status(200).json({
            valid: true,
            message: "Reset token is valid"
        });
    } catch (err) {
        logger.error("Validate Reset Token error:", err);
        const statusCode = err.statusCode || 400;
        return res.status(statusCode).json({
            valid: false,
            message: err.message || "Invalid or expired reset token",
        });
    }
};

export const confirmPasswordReset = async (req, res) => {
    try {
        const { emailId, token, newPassword } = req.body;

        const user = await resetPassword({ emailId, token, newPassword });

        return res.status(200).json({
            message: "Password reset successful. You can now log in."
        });
    } catch (err) {
        logger.error("Confirm Password Reset error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user?._id || req.userId;
        if (userId) {
            await logoutUser(userId);
        }

        res.clearCookie("auth_token", COOKIE_OPTIONS);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        logger.error("Logout error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const getCurrentUserHandler = async (req, res) => {
    try {
        const userId = req.user?._id || req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await getCurrentUser(userId);
        const safeUser = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

        return res.status(200).json({ user: safeUser });
    } catch (err) {
        logger.error("Get Current User error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const getUserByIdHandler = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await getUserById(userId);
        const safeUser = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

        return res.status(200).json({ user: safeUser });
    } catch (err) {
        logger.error("Get User By ID error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const getUserByEmailHandler = async (req, res) => {
    try {
        const { emailId } = req.params;

        const user = await getUserByEmail(emailId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const safeUser = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

        return res.status(200).json({ user: safeUser });
    } catch (err) {
        logger.error("Get User By Email error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const searchUsersHandler = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user?._id || req.userId;

        const users = await searchUsers(query, currentUserId);

        return res.status(200).json({ users });
    } catch (err) {
        logger.error("Search Users error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const updateUserRoleHandler = async (req, res) => {
    try {
        const { userId, role } = req.body;

        const user = await updateUserRole({ userId, role });
        const safeUser = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

        return res.status(200).json({
            message: "User role updated successfully",
            user: safeUser
        });
    } catch (err) {
        logger.error("Update User Role error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};

export const updateUserStatusHandler = async (req, res) => {
    try {
        const { userId, status } = req.body;

        const user = await updateUserStatus({ userId, status });
        const safeUser = typeof user.toJSON === "function" ? user.toJSON() : { ...user };

        return res.status(200).json({
            message: "User status updated successfully",
            user: safeUser
        });
    } catch (err) {
        logger.error("Update User Status error:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Internal server error",
        });
    }
};