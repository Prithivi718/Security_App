import { bytesToBase64, base64ToBytes, stringToUint8Array, uint8ArrayToString } from "../crypto/encoding.service.js";
import { deriveSessionKey } from "../crypto/hkdf.service.js";
import { encryptAESGCM, decryptAESGCM } from "../crypto/aesGcm.service.js";
import keyService from "../crypto/key.service.js";

async function runTests() {
    console.log("=== STARTING END-TO-END WEB CRYPTO VERIFICATION ===");

    // 1. Test Encoding Service
    console.log("\n1. Testing Encoding Service...");
    const sampleStr = "Hello SecureNet Web Crypto!";
    const bytes = stringToUint8Array(sampleStr);
    const b64 = bytesToBase64(bytes);
    const decodedBytes = base64ToBytes(b64);
    const restoredStr = uint8ArrayToString(decodedBytes);
    if (restoredStr !== sampleStr) {
        throw new Error(`Encoding test failed! Expected "${sampleStr}", got "${restoredStr}"`);
    }
    console.log("   ✓ Encoding / Base64 conversions passed");

    // 2. Test HKDF Key Derivation via Web Crypto API
    console.log("\n2. Testing HKDF Key Derivation (Web Crypto SHA-256)...");
    const sharedSecret = "SuperSecretPassword123!";
    const kdfSaltBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const kdfSalt = bytesToBase64(kdfSaltBytes);
    const info = "SecureNet/chat/v1";

    const key1 = await deriveSessionKey({ sharedSecret, kdfSalt, info, keyVersion: 1 });
    const key2 = await deriveSessionKey({ sharedSecret, kdfSalt, info, keyVersion: 1 });

    if (!key1 || key1.type !== "secret" || key1.algorithm.name !== "AES-GCM") {
        throw new Error("HKDF returned invalid AES-GCM CryptoKey!");
    }
    console.log("   ✓ Web Crypto HKDF key derivation verified (AES-GCM CryptoKey created successfully)");

    // 3. Test AES-256-GCM Encryption & Decryption
    console.log("\n3. Testing AES-256-GCM Encryption & Decryption...");
    const plaintext = "Top secret message content from Alice to Bob";
    const aad = "SecureNet|friendship|friendship123|v1";

    const encrypted = await encryptAESGCM({ message: plaintext, sessionKey: key1, aad });
    console.log("   Ciphertext (b64):", encrypted.ciphertext);
    console.log("   IV (b64):", encrypted.iv);
    console.log("   AuthTag (b64):", encrypted.authTag);

    const decrypted = await decryptAESGCM({
        ciphertext: encrypted.ciphertext,
        sessionKey: key1,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        aad
    });

    if (!decrypted.success || decrypted.plaintext !== plaintext) {
        throw new Error(`AES-GCM Decryption failed! ${decrypted.error}`);
    }
    console.log("   ✓ AES-GCM Encryption and Decryption roundtrip successful");

    // 4. Test AuthTag / Tamper Failure
    console.log("\n4. Testing AuthTag Tamper Detection...");
    const tamperedBytes = base64ToBytes(encrypted.ciphertext);
    tamperedBytes[0] ^= 0xff; // Tamper with 1 bit
    const tamperedCiphertext = bytesToBase64(tamperedBytes);

    const tamperedDecryption = await decryptAESGCM({
        ciphertext: tamperedCiphertext,
        sessionKey: key1,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        aad
    });
    if (tamperedDecryption.success) {
        throw new Error("Tampered ciphertext passed AuthTag check!");
    }
    console.log("   ✓ AuthTag correctly rejected tampered ciphertext");

    // 5. Test Key Store Volatile Lifecycle
    console.log("\n5. Testing Key Store Volatile Lifecycle...");
    const conversationId = "friendship:friendship123";
    keyService.openConversationKey(conversationId, key1);

    if (!keyService.hasConversationKey(conversationId)) {
        throw new Error("Key store failed to register conversation key!");
    }
    const retrievedKey = keyService.getConversationKey(conversationId);
    if (retrievedKey !== key1) {
        throw new Error("Retrieved key does not match stored CryptoKey!");
    }

    keyService.clearConversationKey(conversationId);
    if (keyService.hasConversationKey(conversationId)) {
        throw new Error("Key store failed to clear conversation key!");
    }
    console.log("   ✓ Volatile key store correctly opened, retrieved, and purged key material");

    console.log("\n=== ALL WEB CRYPTO TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
    console.error("Test Failure:", err);
    process.exit(1);
});
