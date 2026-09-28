import api from "./api.js";
import { getConversationKey, hasConversationKey } from "./crypto/key.service.js";
import { encryptAESGCM, decryptAESGCM } from "./crypto/aesGcm.service.js";

/**
 * Message Service - Encrypted Message API & Local AES-256-GCM Processing
 */

/**
 * Constructs deterministic Associated Authenticated Data (AAD) for GCM verification
 */
const constructAAD = (type, targetId, keyVersion = 1) => {
    return `SecureNet|${type}|${targetId}|v${keyVersion}`;
};

/**
 * Encrypts plaintext locally and POSTs ciphertext payload to server
 * 
 * @param {Object} params
 * @param {string} [params.friendshipId]
 * @param {string} [params.groupId]
 * @param {string} params.messageText Plaintext message string
 * @param {string} [params.messageType="text"]
 * @param {number} [params.keyVersion=1]
 * @param {number} [params.cryptoVersion=1]
 */
export const sendMessage = async ({
    friendshipId,
    groupId,
    messageText,
    messageType = "text",
    keyVersion = 1,
    cryptoVersion = 1
}) => {
    if (!friendshipId && !groupId) {
        throw new Error("Target friendshipId or groupId is required to send message");
    }

    if (!messageText && messageText !== "") {
        throw new Error("Message text is required");
    }

    const type = friendshipId ? "friendship" : "group";
    const targetId = friendshipId || groupId;
    const conversationId = `${type}:${targetId}`;

    // Retrieve volatile CryptoKey
    const sessionKey = getConversationKey(conversationId);
    if (!sessionKey) {
        throw new Error("Secure chat session is locked or expired. Please unlock the chat to send messages.");
    }

    // Construct deterministic AAD
    const aad = constructAAD(type, targetId, keyVersion);

    // Encrypt message locally
    const encrypted = encryptAESGCM({
        message: messageText,
        sessionKey,
        aad
    });

    // POST only ciphertext + nonce + authTag + metadata to server
    const payload = {
        friendshipId: friendshipId || undefined,
        groupId: groupId || undefined,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion,
        cryptoVersion,
        messageType
    };

    return api.post("/messages", payload);
};

/**
 * GETs encrypted messages from server and decrypts them locally using volatile CryptoKey
 * 
 * @param {Object} params
 * @param {string} [params.friendshipId]
 * @param {string} [params.groupId]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 */
export const getMessages = async ({
    friendshipId,
    groupId,
    page = 1,
    limit = 50
}) => {
    if (!friendshipId && !groupId) {
        throw new Error("Target friendshipId or groupId is required to fetch messages");
    }

    const type = friendshipId ? "friendship" : "group";
    const targetId = friendshipId || groupId;
    const conversationId = `${type}:${targetId}`;

    const sessionKey = getConversationKey(conversationId);
    if (!sessionKey) {
        throw new Error("Secure chat session is locked or expired. Please unlock the chat to view messages.");
    }

    const queryParams = new URLSearchParams();
    if (friendshipId) queryParams.append("friendshipId", friendshipId);
    if (groupId) queryParams.append("groupId", groupId);
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    const response = await api.get(`/messages?${queryParams.toString()}`);

    const messages = Array.isArray(response) ? response : (response.messages || []);

    // Decrypt messages locally
    const decryptedMessages = messages.map((msg) => {
        const keyVer = msg.keyVersion || 1;
        const aad = constructAAD(type, targetId, keyVer);

        const result = decryptAESGCM({
            ciphertext: msg.ciphertext,
            sessionKey,
            iv: msg.nonce || msg.iv,
            authTag: msg.authTag,
            aad
        });

        return {
            ...msg,
            plaintext: result.success ? result.plaintext : null,
            decryptionError: result.success ? null : (result.error || "Decryption failed")
        };
    });

    if (Array.isArray(response)) {
        return decryptedMessages;
    }

    return {
        ...response,
        messages: decryptedMessages
    };
};

export default {
    sendMessage,
    getMessages
};
