import api from "./api.js";
import { getConversationKey } from "./crypto/key.service.js";
import { encryptAESGCM, decryptAESGCM } from "./crypto/aesGcm.service.js";

/**
 * Message Service - Encrypted Message API & Local Web Crypto AES-256-GCM Processing
 */

/**
 * Constructs deterministic Associated Authenticated Data (AAD) for GCM verification
 */
const constructAAD = (type, targetId, keyVersion = 1) => {
    return `SecureNet|${type}|${targetId}|v${keyVersion}`;
};

/**
 * Encrypts plaintext locally using Web Crypto AES-GCM and POSTs ciphertext payload to server
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

    // Encrypt message locally using Web Crypto API
    const encrypted = await encryptAESGCM({
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

    return api.post("/message", payload);
};

/**
 * GETs encrypted messages from server and decrypts them locally using volatile CryptoKey via Web Crypto API
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

    const response = await api.get(`/message?${queryParams.toString()}`);

    const messages = Array.isArray(response) ? response : (response.messages || []);

    // Decrypt messages locally using Web Crypto API
    const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
            const keyVer = msg.keyVersion || 1;
            const aad = constructAAD(type, targetId, keyVer);

            const result = await decryptAESGCM({
                ciphertext: msg.ciphertext,
                sessionKey,
                iv: msg.nonce || msg.iv,
                authTag: msg.authTag,
                aad
            });

            return {
                ...msg,
                plaintext: result.success ? result.plaintext : null,
                decryptionError: result.success ? null : (result.error || "Unable to decrypt this message.")
            };
        })
    );

    if (Array.isArray(response)) {
        return decryptedMessages;
    }

    return {
        ...response,
        messages: decryptedMessages
    };
};

/**
 * Fetches all active friends and group contacts for chat sidebar
 */
export const getChatContacts = async () => {
    return api.get("/message/contacts");
};

export default {
    sendMessage,
    getMessages,
    getChatContacts
};
