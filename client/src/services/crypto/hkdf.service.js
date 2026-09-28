import { stringToUint8Array, base64ToBytes } from "./encoding.service.js";

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
 * Derives an AES-256-GCM CryptoKey using HKDF (SHA-256) via native Web Crypto API.
 * 
 * @param {Object} params
 * @param {string|Uint8Array} params.sharedSecret
 * @param {string|Uint8Array} params.kdfSalt Base64 salt string returned by backend
 * @param {string|Uint8Array} [params.info="SecureNet/chat/v1"]
 * @param {number} [params.keyVersion=1]
 * @returns {Promise<CryptoKey>} Derived 256-bit AES-GCM CryptoKey
 */
export const deriveSessionKey = async ({
    sharedSecret,
    kdfSalt,
    info = "SecureNet/chat/v1",
    keyVersion = 1
}) => {
    try {
        if (!sharedSecret) {
            throw new Error("Shared secret is required for key derivation");
        }

        if (!kdfSalt) {
            throw new Error("kdfSalt is required for key derivation");
        }

        const crypto = getWebCrypto();

        const secretBytes = typeof sharedSecret === "string"
            ? stringToUint8Array(sharedSecret)
            : (sharedSecret instanceof Uint8Array ? sharedSecret : new Uint8Array(sharedSecret));

        const saltBytes = typeof kdfSalt === "string"
            ? base64ToBytes(kdfSalt)
            : (kdfSalt instanceof Uint8Array ? kdfSalt : new Uint8Array(kdfSalt));

        const infoBytes = typeof info === "string"
            ? stringToUint8Array(info)
            : (info instanceof Uint8Array ? info : new Uint8Array(info));

        // 1. Import user-entered shared secret as HKDF base key
        const baseKey = await crypto.subtle.importKey(
            "raw",
            secretBytes,
            "HKDF",
            false,
            ["deriveBits"]
        );

        // 2. Derive 256 bits (32 bytes) using HKDF-SHA-256 with backend salt & info
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "HKDF",
                hash: "SHA-256",
                salt: saltBytes,
                info: infoBytes
            },
            baseKey,
            256
        );

        // 3. Import derived 256-bit material as AES-GCM CryptoKey
        const aesCryptoKey = await crypto.subtle.importKey(
            "raw",
            derivedBits,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        return aesCryptoKey;
    } catch (error) {
        console.error("HKDF Derivation error:", error);
        throw new Error("Unable to establish secure encryption session.");
    }
};

/**
 * Async deriveSessionKeySync for backward compatibility
 */
export const deriveSessionKeySync = async (params) => {
    return deriveSessionKey(params);
};

export default {
    deriveSessionKey,
    deriveSessionKeySync
};
