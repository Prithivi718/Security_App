import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();


import { User } from "../models/auth/user.model.js";

import { hashValue } from "../utils/helper.js";


const SALT_ROUNDS = 12;

// Login lockout configuration
const THRESHOLD_SHORT = 3;
const SHORT_LOCK_MS = 1 * 60 * 1000;              // 1 minute
const LONG_LOCK_MS = 2 * 24 * 60 * 60 * 1000;   // 2 days

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const OTP_EXPIRY_MS = 5 * 60 * 1000;             // 5 minutes

// --------------------------------------------------
// CREATE USER
// --------------------------------------------------

export const createUser = async ({
    userName,
    emailId,
    password
}) => {

    const existingUser = await User.findOne({
        $or: [
            { userName: userName.toLowerCase() },
            { emailId: emailId.toLowerCase() },
        ],
    });

    if (existingUser) {
        const error = new Error("Username or email already exists");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(
        password,
        SALT_ROUNDS
    );

    // Check user role
    const super_admin_emails = process.env.SUPERADMIN_EMAILS
        .split(",")
        .map(email => email.trim().toLowerCase())


    const role = super_admin_emails.includes(
        emailId.toLowerCase().trim()
    )
        ? "admin"
        : "user";



    const user = await User.create({
        userName: userName.toLowerCase().trim(),
        emailId: emailId.toLowerCase().trim(),
        passwordHash,
        role,
        status: "active",
        emailVerified: false,
    });

    return user;
};


// --------------------------------------------------
// FIND USER
// --------------------------------------------------

export const getUserById = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};


export const getUserByEmail = async (emailId) => {
    if (!emailId) return null;
    return User.findOne({
        emailId: emailId.toLowerCase().trim(),
    });
};


// --------------------------------------------------
// OTP
// --------------------------------------------------

export const createSignupOtp = async (userId) => {

    const otp = crypto
        .randomInt(100000, 1000000)
        .toString();

    const hashedOtp = hashValue(otp);

    await User.findByIdAndUpdate(userId, {
        otp_code: hashedOtp,
        otp_expiry: new Date(
            Date.now() + OTP_EXPIRY_MS
        ),
    });

    // Return raw OTP to controller
    // Controller can send it through email.
    return otp;
};


export const verifySignupOtp = async ({
    emailId,
    otp,
}) => {

    const hashedOtp = hashValue(otp);

    const user = await User.findOne({
        emailId: emailId.toLowerCase().trim(),
        otp_code: hashedOtp,
        otp_expiry: {
            $gt: new Date(),
        },
    }).select("+otp_code +otp_expiry");

    if (!user) {
        const error = new Error(
            "Invalid or expired OTP"
        );

        error.statusCode = 400;
        throw error;
    }

    user.emailVerified = true;

    user.otp_code = undefined;
    user.otp_expiry = undefined;

    await user.save({
        validateBeforeSave: false,
    });

    return user;
};


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

export const authenticateUser = async ({
    emailId,
    password,
}) => {

    const user = await User.findOne({
        emailId: emailId.toLowerCase().trim(),
    }).select(
        "+failed_login_attempts " +
        "+locked_until " +
        "+lockout_level"
    );

    if (!user) {
        const error = new Error(
            "Invalid credentials"
        );

        error.statusCode = 401;
        throw error;
    }


    // ----------------------------------------------
    // Account status
    // ----------------------------------------------

    if (user.status === "blocked") {

        const error = new Error(
            "Account is blocked"
        );

        error.statusCode = 403;
        throw error;
    }


    if (!user.emailVerified) {

        const error = new Error(
            "Please verify your email before logging in"
        );

        error.statusCode = 403;
        throw error;
    }


    // ----------------------------------------------
    // Lock check
    // ----------------------------------------------

    if (
        user.locked_until &&
        user.locked_until.getTime() > Date.now()
    ) {

        const remainingMinutes = Math.ceil(
            (
                user.locked_until.getTime() -
                Date.now()
            ) / 60000
        );

        const error = new Error(
            `Account locked. Try again in ${remainingMinutes} minute(s)`
        );

        error.statusCode = 423;
        throw error;
    }


    // ----------------------------------------------
    // Password verification
    // ----------------------------------------------

    const validPassword = await bcrypt.compare(
        password,
        user.passwordHash
    );


    // ----------------------------------------------
    // Invalid password
    // ----------------------------------------------

    if (!validPassword) {

        user.failed_login_attempts =
            (user.failed_login_attempts || 0) + 1;


        // First lockout
        if (
            user.failed_login_attempts >=
            THRESHOLD_SHORT
        ) {

            if (
                !user.lockout_level ||
                user.lockout_level === 0
            ) {

                user.lockout_level = 1;

                user.locked_until = new Date(
                    Date.now() + SHORT_LOCK_MS
                );

            } else {

                // Escalated lockout
                user.lockout_level = 2;

                user.locked_until = new Date(
                    Date.now() + LONG_LOCK_MS
                );

            }

            user.failed_login_attempts = 0;
        }


        await user.save({
            validateBeforeSave: false,
        });


        const error = new Error(
            "Invalid credentials"
        );

        error.statusCode = 401;

        throw error;
    }


    // ----------------------------------------------
    // Successful login
    // ----------------------------------------------

    user.failed_login_attempts = 0;
    user.locked_until = undefined;
    user.lockout_level = 0;

    user.lastLoginAt = new Date();
    user.status = "active";

    await user.save({
        validateBeforeSave: false,
    });

    return user;
};


// --------------------------------------------------
// PASSWORD RESET TOKEN
// --------------------------------------------------

export const createPasswordResetToken = async (
    emailId
) => {

    const user = await User.findOne({
        emailId: emailId.toLowerCase().trim(),
    }).select(
        "+reset_token +reset_token_expiry"
    );

    // Don't expose account existence
    if (!user) {
        return null;
    }


    const rawToken = crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken = hashValue(rawToken);

    user.reset_token = hashedToken;

    user.reset_token_expiry = new Date(
        Date.now() + PASSWORD_RESET_EXPIRY_MS
    );

    await user.save({
        validateBeforeSave: false,
    });


    // Controller sends this token through email
    return {
        user,
        rawToken,
    };
};


// --------------------------------------------------
// PASSWORD RESET TOKEN VALIDATION
// --------------------------------------------------

export const validateResetToken = async ({
    emailId,
    token,
}) => {
    if (!emailId || !token) {
        const error = new Error("Email ID and token are required");
        error.statusCode = 400;
        throw error;
    }

    const hashedToken = hashValue(token);

    const user = await User.findOne({
        emailId: emailId.toLowerCase().trim(),
        reset_token: hashedToken,
        reset_token_expiry: {
            $gt: new Date(),
        },
    });

    if (!user) {
        const error = new Error("Invalid or expired reset token");
        error.statusCode = 400;
        throw error;
    }

    return true;
};

// --------------------------------------------------
// RESET PASSWORD
// --------------------------------------------------

export const resetPassword = async ({
    emailId,
    token,
    newPassword,
}) => {

    const hashedToken = hashValue(token);

    const user = await User.findOne({
        emailId: emailId.toLowerCase().trim(),

        reset_token: hashedToken,

        reset_token_expiry: {
            $gt: new Date(),
        },

    }).select(
        "+reset_token " +
        "+reset_token_expiry"
    );


    if (!user) {

        const error = new Error(
            "Invalid or expired reset token"
        );

        error.statusCode = 400;
        throw error;
    }


    const newPasswordHash = await bcrypt.hash(
        newPassword,
        SALT_ROUNDS
    );

    user.passwordHash = newPasswordHash;

    user.reset_token = undefined;
    user.reset_token_expiry = undefined;

    user.failed_login_attempts = 0;
    user.locked_until = undefined;
    user.lockout_level = 0;

    // Invalidate existing JWTs
    user.token_version =
        (user.token_version || 0) + 1;

    await user.save({
        validateBeforeSave: false,
    });

    return user;
};


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

export const logoutUser = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;
        throw error;
    }


    // Invalidate currently issued JWTs
    user.token_version =
        (user.token_version || 0) + 1;

    await user.save({
        validateBeforeSave: false,
    });

    return true;
};


// --------------------------------------------------
// PROFILE
// --------------------------------------------------

export const getCurrentUser = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;
        throw error;
    }

    return user;
};

export const updateProfile = async (userId, { userName, emailId }) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (userName && userName.toLowerCase().trim() !== user.userName) {
        const cleanedUserName = userName.toLowerCase().trim();
        const existingName = await User.findOne({ userName: cleanedUserName, _id: { $ne: userId } });
        if (existingName) {
            const error = new Error("Username already taken");
            error.statusCode = 409;
            throw error;
        }
        user.userName = cleanedUserName;
    }

    if (emailId && emailId.toLowerCase().trim() !== user.emailId) {
        const cleanedEmail = emailId.toLowerCase().trim();
        const existingEmail = await User.findOne({ emailId: cleanedEmail, _id: { $ne: userId } });
        if (existingEmail) {
            const error = new Error("Email address already registered");
            error.statusCode = 409;
            throw error;
        }
        user.emailId = cleanedEmail;
    }

    await user.save();
    return user;
};

export const searchUsers = async (query, currentUserId) => {

    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchRaw = query.trim().toLowerCase();
    // Escape regex special characters (e.g. '.', '+', '*', etc.)
    const searchEscaped = searchRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({
        $and: [
            {
                _id: {
                    $ne: currentUserId
                }
            },
            {
                $or: [
                    {
                        userName: {
                            $regex: searchEscaped,
                            $options: "i"
                        }
                    },
                    {
                        emailId: {
                            $regex: searchEscaped,
                            $options: "i"
                        }
                    }
                ]
            },
            {
                status: "active"
            }
        ]
    })
        .select("_id userName emailId role")
        .limit(10);

    return users;
};

// --------------------------------------------------
// ADMIN OPERATIONS
// --------------------------------------------------

export const updateUserRole = async ({
    userId,
    role,
}) => {

    const allowedRoles = [
        "user",
        "admin",
    ];

    if (!allowedRoles.includes(role)) {
        const error = new Error(
            "Invalid role"
        );

        error.statusCode = 400;
        throw error;
    }


    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;
        throw error;
    }

    return user;
};


export const updateUserStatus = async ({
    userId,
    status,
}) => {

    const allowedStatuses = [
        "active",
        "inactive",
        "blocked",
    ];

    if (!allowedStatuses.includes(status)) {

        const error = new Error(
            "Invalid user status"
        );

        error.statusCode = 400;
        throw error;
    }


    const user = await User.findByIdAndUpdate(
        userId,
        {
            status,
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;
        throw error;
    }

    return user;
};