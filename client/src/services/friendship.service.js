import api from "./api.js";

/**
 * Friendship Service - Friend request management and shared secret establishment
 */

export const sendFriendRequest = async (receiverId) => {
    return api.post("/friendships/request", { receiverId });
};

export const acceptFriendRequest = async (friendshipId) => {
    return api.patch(`/friendships/${friendshipId}/accept`);
};

export const setSharedSecret = async (friendshipId, secretCode) => {
    if (!secretCode) {
        throw new Error("Secret code is required");
    }
    return api.post(`/friendships/${friendshipId}/secret`, { secretCode });
};

export const verifyFriendshipSecret = async (friendshipId, secretCode) => {
    if (!secretCode) {
        throw new Error("Secret code is required");
    }
    return api.post(`/friendships/${friendshipId}/secret/verify`, { secretCode });
};

export default {
    sendFriendRequest,
    acceptFriendRequest,
    setSharedSecret,
    verifyFriendshipSecret
};
