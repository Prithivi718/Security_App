import api from "./api.js";

/**
 * Friendship Service - Friend request management and shared secret establishment
 */

export const sendFriendRequest = async (receiverId) => {
    return api.post("/member/request", { receiverId });
};

export const getPendingFriendRequests = async () => {
    return api.get("/member/pending");
};

export const acceptFriendRequest = async (friendshipId) => {
    return api.patch(`/member/${friendshipId}/accept`);
};

export const setSharedSecret = async (friendshipId, secretCode) => {
    if (!secretCode) {
        throw new Error("Secret code is required");
    }
    return api.post(`/member/${friendshipId}/secret`, { secretCode });
};

export const verifyFriendshipSecret = async (friendshipId, secretCode) => {
    if (!secretCode) {
        throw new Error("Secret code is required");
    }
    return api.post(`/member/${friendshipId}/secret/verify`, { secretCode });
};

export const resetSharedSecret = async (friendshipId) => {
    return api.delete(`/member/${friendshipId}/secret`);
};

export default {
    sendFriendRequest,
    getPendingFriendRequests,
    acceptFriendRequest,
    setSharedSecret,
    resetSharedSecret,
    verifyFriendshipSecret
};
