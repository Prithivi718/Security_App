/**
 * Key Service - In-Memory Volatile Key Manager
 * 
 * Stores derived AES-256-GCM session keys exclusively in JavaScript volatile memory (runtime Map).
 * Keys are never stored in localStorage, sessionStorage, cookies, or IndexedDB.
 * Keys are automatically cleared when chat sessions are locked, revoked, or expired.
 */

class KeyService {
    constructor() {
        /**
         * @type {Map<string, Uint8Array>}
         * Keyed by conversationId (e.g. `friendship:<id>` or `group:<id>`)
         */
        this.keyStore = new Map();
    }

    /**
     * Store a derived session key in volatile memory
     * 
     * @param {string} conversationId Scoped conversation identifier
     * @param {Uint8Array|Buffer} sessionKey 32-byte derived session key
     */
    openConversationKey(conversationId, sessionKey) {
        if (!conversationId) {
            throw new Error("Conversation ID is required to store session key");
        }

        if (!sessionKey) {
            throw new Error("Session key is required");
        }

        const keyBuffer = Buffer.isBuffer(sessionKey)
            ? new Uint8Array(sessionKey)
            : sessionKey;

        this.keyStore.set(conversationId.toString(), keyBuffer);
    }

    /**
     * Retrieve active session key from volatile memory
     * 
     * @param {string} conversationId
     * @returns {Uint8Array|null} Session key if active, or null
     */
    getConversationKey(conversationId) {
        if (!conversationId) return null;
        return this.keyStore.get(conversationId.toString()) || null;
    }

    /**
     * Check if a conversation key exists in memory
     * 
     * @param {string} conversationId
     * @returns {boolean}
     */
    hasConversationKey(conversationId) {
        if (!conversationId) return false;
        return this.keyStore.has(conversationId.toString());
    }

    /**
     * Clear and erase session key for a specific conversation
     * 
     * @param {string} conversationId
     */
    clearConversationKey(conversationId) {
        if (!conversationId) return;
        const key = this.keyStore.get(conversationId.toString());
        if (key && key instanceof Uint8Array) {
            key.fill(0); // Zero out key bytes in memory
        }
        this.keyStore.delete(conversationId.toString());
    }

    /**
     * Clear and zero out all active session keys in memory
     */
    clearAllKeys() {
        for (const [id, key] of this.keyStore.entries()) {
            if (key && key instanceof Uint8Array) {
                key.fill(0);
            }
        }
        this.keyStore.clear();
    }
}

// Singleton instance
const keyServiceInstance = new KeyService();

export const openConversationKey = (conversationId, sessionKey) => keyServiceInstance.openConversationKey(conversationId, sessionKey);
export const getConversationKey = (conversationId) => keyServiceInstance.getConversationKey(conversationId);
export const hasConversationKey = (conversationId) => keyServiceInstance.hasConversationKey(conversationId);
export const clearConversationKey = (conversationId) => keyServiceInstance.clearConversationKey(conversationId);
export const clearAllKeys = () => keyServiceInstance.clearAllKeys();

export default keyServiceInstance;
