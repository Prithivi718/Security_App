import api from "./api.js";

/**
 * User Service - Search and discovery API integration
 */

export const searchUsers = async (query) => {
    return api.get(`/users/search?q=${encodeURIComponent(query)}`);
};

export const getUserById = async (userId) => {
    return api.get(`/users/${userId}`);
};

export const getUserByEmail = async (email) => {
    return api.get(`/users/email/${encodeURIComponent(email)}`);
};

export default {
    searchUsers,
    getUserById,
    getUserByEmail
};
