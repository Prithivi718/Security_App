import crypto from "node:crypto";

const HASH_ALGORITHM = "sha512";
const SESSION_KEY_LENGTH = 32; // 32 bytes = 256 bits for AES-256-GCM

/**
 * Derives an AES-256-GCM key using HKDF based on shared secret and conversation KDF salt
 * 
 * @param {Object} params
 * @param {string|Uint8Array|Buffer} params.sharedSecret Raw shared secret entered by user
 * @param {string|Uint8Array|Buffer} params.kdfSalt Base64 or raw public KDF salt from backend
 * @param {string} [params.info="SecureNet/chat/v1"] Protocol context info string
 * @param {number} [params.keyVersion=1] Key version
 * @returns {Promise<Uint8Array>} Derived 32-byte session key
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

        const secretBuffer = Buffer.isBuffer(sharedSecret)
            ? sharedSecret
            : typeof sharedSecret === "string"
                ? Buffer.from(sharedSecret, "utf8")
                : Buffer.from(sharedSecret);

        const saltBuffer = Buffer.isBuffer(kdfSalt)
            ? kdfSalt
            : typeof kdfSalt === "string"
                ? Buffer.from(kdfSalt, "base64")
                : Buffer.from(kdfSalt);

        const infoBuffer = Buffer.from(`${info}|v${keyVersion}`, "utf8");

        return new Promise((resolve, reject) => {
            crypto.hkdf(
                HASH_ALGORITHM,
                secretBuffer,
                saltBuffer,
                infoBuffer,
                SESSION_KEY_LENGTH,
                (err, derivedKey) => {
                    if (err) {
                        return reject(new Error(`HKDF Key Derivation failed: ${err.message}`));
                    }
                    resolve(new Uint8Array(derivedKey));
                }
            );
        });
    } catch (error) {
        throw new Error(`HKDF Service Error: ${error.message}`);
    }
};

/**
 * Synchronous variant of deriveSessionKey
 */
export const deriveSessionKeySync = ({
    sharedSecret,
    kdfSalt,
    info = "SecureNet/chat/v1",
    keyVersion = 1
}) => {
    if (!sharedSecret) {
        throw new Error("Shared secret is required for key derivation");
    }

    if (!kdfSalt) {
        throw new Error("kdfSalt is required for key derivation");
    }

    const secretBuffer = Buffer.isBuffer(sharedSecret)
        ? sharedSecret
        : typeof sharedSecret === "string"
            ? Buffer.from(sharedSecret, "utf8")
            : Buffer.from(sharedSecret);

    const saltBuffer = Buffer.isBuffer(kdfSalt)
        ? kdfSalt
        : typeof kdfSalt === "string"
            ? Buffer.from(kdfSalt, "base64")
            : Buffer.from(kdfSalt);

    const infoBuffer = Buffer.from(`${info}|v${keyVersion}`, "utf8");

    const derivedKey = crypto.hkdfSync(
        HASH_ALGORITHM,
        secretBuffer,
        saltBuffer,
        infoBuffer,
        SESSION_KEY_LENGTH
    );

    return new Uint8Array(derivedKey);
};

export default {
    deriveSessionKey,
    deriveSessionKeySync
};
