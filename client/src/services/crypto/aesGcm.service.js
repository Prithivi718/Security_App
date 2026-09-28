import {
    bytesToBase64,
    base64ToBytes,
    stringToUint8Array,
    uint8ArrayToString,
    concatUint8Arrays
} from "./encoding.service.js";

const IV_LENGTH = 12; // Standard 12-byte IV for AES-GCM

const getWebCrypto = () => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        return window.crypto;
    }
    if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
        return globalThis.crypto;
    }
    throw new Error("Web Crypto API (crypto.subtle) is not available in this environment.");
};

/**
 * Ensures key material is a valid CryptoKey object usable for AES-GCM operations.
 */
const getCryptoKey = async (sessionKey, usages) => {
    const crypto = getWebCrypto();
    if (sessionKey && typeof sessionKey === "object" && sessionKey.type === "secret") {
        return sessionKey; // Already a Web Crypto CryptoKey instance
    }

    const keyBytes = sessionKey instanceof Uint8Array
        ? sessionKey
        : new Uint8Array(sessionKey);

    if (keyBytes.length !== 32) {
        throw new Error(`Invalid session key length. Expected 32 bytes, got ${keyBytes.length}`);
    }

    return crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM", length: 256 },
        false,
        usages
    );
};

/**
 * Encrypts a plaintext message using AES-256-GCM via Web Crypto API
 * 
 * @param {Object} params
 * @param {string} params.message Plaintext message to encrypt
 * @param {CryptoKey|Uint8Array} params.sessionKey 256-bit AES-GCM key
 * @param {string} [params.aad=null] Associated Authenticated Data
 * @returns {Promise<{ciphertext: string, iv: string, authTag: string}>} Base64 encoded payload
 */
export const encryptAESGCM = async ({
    message,
    sessionKey,
    aad = null
}) => {
    try {
        if (!message && message !== "") {
            throw new Error("Message is required for encryption");
        }

        if (!sessionKey) {
            throw new Error("Session key is required for encryption");
        }

        const crypto = getWebCrypto();
        const cryptoKey = await getCryptoKey(sessionKey, ["encrypt"]);

        // Generate fresh, cryptographically strong 12-byte random IV for every message
        const ivBytes = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const plaintextBytes = stringToUint8Array(message);
        const aadBytes = aad ? stringToUint8Array(aad) : undefined;

        const encryptParams = {
            name: "AES-GCM",
            iv: ivBytes
        };
        if (aadBytes) {
            encryptParams.additionalData = aadBytes;
        }

        const encryptedBuffer = await crypto.subtle.encrypt(
            encryptParams,
            cryptoKey,
            plaintextBytes
        );

        const encryptedArray = new Uint8Array(encryptedBuffer);
        // Web Crypto AES-GCM appends the 16-byte authentication tag at the end of the ciphertext
        const ciphertextBytes = encryptedArray.subarray(0, encryptedArray.length - 16);
        const authTagBytes = encryptedArray.subarray(encryptedArray.length - 16);

        return {
            ciphertext: bytesToBase64(ciphertextBytes),
            iv: bytesToBase64(ivBytes),
            authTag: bytesToBase64(authTagBytes)
        };
    } catch (error) {
        console.error("AES-GCM Encryption error:", error);
        throw new Error("Unable to encrypt message.");
    }
};

/**
 * Decrypts an AES-256-GCM encrypted ciphertext via Web Crypto API
 * 
 * @param {Object} params
 * @param {string} params.ciphertext Base64 encoded ciphertext
 * @param {CryptoKey|Uint8Array} params.sessionKey 256-bit AES-GCM key
 * @param {string} params.iv Base64 encoded IV (nonce)
 * @param {string} params.authTag Base64 encoded AuthTag
 * @param {string} [params.aad=null] Associated Authenticated Data
 * @returns {Promise<{success: boolean, plaintext: string|null, error?: string}>}
 */
export const decryptAESGCM = async ({
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

        const crypto = getWebCrypto();
        const cryptoKey = await getCryptoKey(sessionKey, ["decrypt"]);

        const ciphertextBytes = base64ToBytes(ciphertext);
        const ivBytes = base64ToBytes(iv);
        const authTagBytes = base64ToBytes(authTag);
        const aadBytes = aad ? stringToUint8Array(aad) : undefined;

        if (ivBytes.length !== IV_LENGTH) {
            throw new Error("Invalid IV length");
        }

        // Web Crypto AES-GCM expects [ ciphertext ... authTag ] concatenated together
        const combinedBytes = concatUint8Arrays([ciphertextBytes, authTagBytes]);

        const decryptParams = {
            name: "AES-GCM",
            iv: ivBytes
        };
        if (aadBytes) {
            decryptParams.additionalData = aadBytes;
        }

        const decryptedBuffer = await crypto.subtle.decrypt(
            decryptParams,
            cryptoKey,
            combinedBytes
        );

        return {
            success: true,
            plaintext: uint8ArrayToString(new Uint8Array(decryptedBuffer))
        };
    } catch (error) {
        return {
            success: false,
            plaintext: null,
            error: "Unable to decrypt this message."
        };
    }
};

export default {
    encryptAESGCM,
    decryptAESGCM
};
