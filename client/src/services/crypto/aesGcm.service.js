import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a plaintext message using AES-256-GCM
 * 
 * @param {Object} params
 * @param {string} params.message Plaintext string to encrypt
 * @param {Uint8Array|Buffer} params.sessionKey 32-byte session key
 * @param {string} [params.aad=null] Optional Additional Authenticated Data string
 * @returns {Object} { ciphertext: string (base64), iv: string (base64), authTag: string (base64) }
 */
export const encryptAESGCM = ({
    message,
    sessionKey,
    aad = null
}) => {
    if (!message && message !== "") {
        throw new Error("Message is required for encryption");
    }

    if (!sessionKey) {
        throw new Error("Session key is required for encryption");
    }

    const keyBuffer = Buffer.isBuffer(sessionKey)
        ? sessionKey
        : Buffer.from(sessionKey);

    if (keyBuffer.length !== KEY_LENGTH) {
        throw new Error(`Invalid session key length. Expected ${KEY_LENGTH} bytes, got ${keyBuffer.length}`);
    }

    // GCM standard 12-byte random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        keyBuffer,
        iv
    );

    if (aad) {
        cipher.setAAD(Buffer.from(aad, "utf8"));
    }

    const encryptedBuffer = Buffer.concat([
        cipher.update(message, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
        ciphertext: encryptedBuffer.toString("base64"),
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64")
    };
};

/**
 * Decrypts an AES-256-GCM encrypted ciphertext
 * 
 * @param {Object} params
 * @param {string} params.ciphertext Base64 encoded ciphertext
 * @param {Uint8Array|Buffer} params.sessionKey 32-byte session key
 * @param {string} params.iv Base64 encoded 12-byte IV
 * @param {string} params.authTag Base64 encoded 16-byte authTag
 * @param {string} [params.aad=null] Optional Additional Authenticated Data string
 * @returns {Object} { success: boolean, plaintext: string|null, error?: string }
 */
export const decryptAESGCM = ({
    ciphertext,
    sessionKey,
    iv,
    authTag,
    aad = null
}) => {
    try {
        if (!ciphertext) {
            throw new Error("Ciphertext is required for decryption");
        }

        if (!sessionKey) {
            throw new Error("Session key is required for decryption");
        }

        if (!iv) {
            throw new Error("IV is required for decryption");
        }

        if (!authTag) {
            throw new Error("AuthTag is required for decryption");
        }

        const keyBuffer = Buffer.isBuffer(sessionKey)
            ? sessionKey
            : Buffer.from(sessionKey);

        if (keyBuffer.length !== KEY_LENGTH) {
            throw new Error(`Invalid session key length. Expected ${KEY_LENGTH} bytes`);
        }

        const ciphertextBuffer = Buffer.from(ciphertext, "base64");
        const ivBuffer = Buffer.from(iv, "base64");
        const authTagBuffer = Buffer.from(authTag, "base64");

        if (ivBuffer.length !== IV_LENGTH) {
            throw new Error("Invalid IV length");
        }

        if (authTagBuffer.length !== AUTH_TAG_LENGTH) {
            throw new Error("Invalid AuthTag length");
        }

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            keyBuffer,
            ivBuffer
        );

        decipher.setAuthTag(authTagBuffer);

        if (aad) {
            decipher.setAAD(Buffer.from(aad, "utf8"));
        }

        const decryptedBuffer = Buffer.concat([
            decipher.update(ciphertextBuffer),
            decipher.final()
        ]);

        return {
            success: true,
            plaintext: decryptedBuffer.toString("utf8")
        };
    } catch (error) {
        return {
            success: false,
            plaintext: null,
            error: error.message || "Decryption failed or authentication tag mismatch"
        };
    }
};

export default {
    encryptAESGCM,
    decryptAESGCM
};
