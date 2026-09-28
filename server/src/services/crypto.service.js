import crypto from "node:crypto";
import argon2 from "argon2";

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536,  // KiB = 64 MB
    timeCost: 3,        // passes
    parallelism: 4,
    hashLength: 32,     // 32 bytes = 256 bits
    raw: true
};

export const createSecretVerifier = async (secretCode, existingKdfSalt = null) => {

    if (!secretCode || typeof secretCode !== "string") {
        throw new Error("Secret code is required");
    }

    const salt = crypto.randomBytes(16);
    const kdfSalt = existingKdfSalt || crypto.randomBytes(16).toString("base64");

    const hash = await argon2.hash(secretCode, {
        ...ARGON2_OPTIONS,
        salt,
    });

    return {
        secretVerifier: hash.toString("hex"),
        kdfSalt: kdfSalt,
        secretSalt: salt.toString("hex"),
    };
};

// utils/secretCrypto.js

export const verifySecret = async (
    secretCode,
    storedVerifier,
    storedSalt
) => {

    if (!secretCode || !storedVerifier || !storedSalt) {
        return false;
    }

    const salt = Buffer.from(
        storedSalt,
        "hex"
    );

    const derivedHash = await argon2.hash(secretCode, {
        ...ARGON2_OPTIONS,
        salt,
    });

    const storedHash = Buffer.from(
        storedVerifier,
        "hex"
    );

    if (derivedHash.length !== storedHash.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        derivedHash,
        storedHash
    );
};