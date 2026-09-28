import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
    {

        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            match: [/^[a-z0-9._-]+$/, "Invalid username"],
        },

        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: "Please enter a valid email address",
            },
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active"
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        lastLoginAt: {
            type: Date,
            default: null
        },

        // Password reset fields
        reset_token: { type: String, select: false },
        reset_token_expiry: { type: Date, select: false },

        // Security metadata
        otp_code: { type: String, select: false },
        otp_expiry: { type: Date, select: false },

        failed_login_attempts: {
            type: Number,
            default: 0,
            select: false,
        },
        locked_until: { type: Date, select: false },
        lockout_level: {
            type: Number,
            default: 0,
            select: false,
        },

        // Remote logout tracking
        token_version: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Virtual password field for plain-text assignment
userSchema.virtual("password").set(function (password) {
    this._password = password;
});

// Hash password before validation if provided
userSchema.pre("validate", async function () {
    if (!this._password) return;

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this._password, salt);
});

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
};

// Generate password reset token and expiry
userSchema.methods.createResetToken = function (expiryMs = 60 * 60 * 1000) {
    const rawToken = crypto.randomBytes(32).toString("hex");

    this.reset_token = crypto.createHash("sha256").update(rawToken).digest("hex");

    this.reset_token_expiry = Date.now() + expiryMs;

    return rawToken;
};

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();

    delete obj.passwordHash;
    delete obj.reset_token;
    delete obj.reset_token_expiry;
    delete obj.locked_until;

    return obj;
};

export const User = mongoose.model("User", userSchema);