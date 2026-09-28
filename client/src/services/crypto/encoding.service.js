/**
 * Encoding Service - Helper utilities for binary and Base64 conversions
 * Web Crypto API and browser compatible without Node Buffer dependencies.
 */

export const bytesToBase64 = (bytes) => {
    if (!bytes) return "";
    const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = "";
    const len = uint8.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
        binary += String.fromCharCode.apply(null, uint8.subarray(i, Math.min(i + chunkSize, len)));
    }
    return btoa(binary);
};

export const base64ToBytes = (base64Str) => {
    if (!base64Str) return new Uint8Array(0);
    const binary = atob(base64Str);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export const stringToUint8Array = (str) => {
    if (!str) return new Uint8Array(0);
    return new TextEncoder().encode(str);
};

export const uint8ArrayToString = (bytes) => {
    if (!bytes) return "";
    const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    return new TextDecoder().decode(uint8);
};

export const concatUint8Arrays = (arrays) => {
    let totalLength = arrays.reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (let item of arrays) {
        if (!item) continue;
        const arr = item instanceof Uint8Array ? item : new Uint8Array(item);
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
};

export default {
    bytesToBase64,
    base64ToBytes,
    stringToUint8Array,
    uint8ArrayToString,
    concatUint8Arrays
};
