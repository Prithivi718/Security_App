/**
 * Encoding Service - Helper utilities for binary and Base64 conversions
 */

export const bytesToBase64 = (bytes) => {
    if (!bytes) return "";
    const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    return buf.toString("base64");
};

export const base64ToBytes = (base64Str) => {
    if (!base64Str) return new Uint8Array(0);
    return new Uint8Array(Buffer.from(base64Str, "base64"));
};

export const stringToUint8Array = (str) => {
    if (!str) return new Uint8Array(0);
    return new Uint8Array(Buffer.from(str, "utf8"));
};

export const uint8ArrayToString = (bytes) => {
    if (!bytes) return "";
    const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    return buf.toString("utf8");
};

export default {
    bytesToBase64,
    base64ToBytes,
    stringToUint8Array,
    uint8ArrayToString
};
