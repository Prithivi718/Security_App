import api from "./api.js";

/**
 * Auth Service - User authentication and account management API integration
 */

export const register = async (userData) => {
    return api.post("/auth/register", userData);
};

export const verifyOTP = async ({ emailId, otp }) => {
    return api.post("/auth/verify-otp", { emailId, otp });
};

export const resendOTP = async ({ emailId }) => {
    return api.post("/auth/resend-otp", { emailId });
};

export const login = async ({ emailId, password }) => {
    return api.post("/auth/login", { emailId, password });
};

export const logout = async () => {
    return api.post("/auth/logout");
};

export const getCurrentUser = async () => {
    return api.get("/auth/me");
};

export const forgotPassword = async ({ emailId }) => {
    return api.post("/auth/forgot-password", { emailId });
};

export const resetPassword = async ({ emailId, token, password }) => {
    return api.post("/auth/reset-password", { emailId, token, password });
};

export default {
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword
};
