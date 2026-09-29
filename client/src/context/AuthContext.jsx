import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [authError, setAuthError] = useState(null);

    const checkAuthStatus = async () => {
        try {
            setInitializing(true);
            const data = await authService.getCurrentUser();
            if (data && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setInitializing(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async ({ emailId, password }) => {
        try {
            setIsLoading(true);
            setAuthError(null);
            const data = await authService.login({ emailId, password });
            if (data && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, data };
            }
            return { success: false, message: data.message || "Login failed" };
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "Login failed";
            setAuthError({ statusCode, message });
            return { success: false, statusCode, message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            setAuthError(null);
            const data = await authService.register(userData);
            return { success: true, data };
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "Registration failed";
            setAuthError({ statusCode, message });
            return { success: false, statusCode, message };
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async ({ emailId, otp }) => {
        try {
            setIsLoading(true);
            setAuthError(null);
            const data = await authService.verifyOTP({ emailId, otp });
            if (data && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true, data };
            }
            return { success: false, message: data.message || "OTP Verification failed" };
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "OTP verification failed";
            setAuthError({ statusCode, message });
            return { success: false, statusCode, message };
        } finally {
            setIsLoading(false);
        }
    };

    const resendOTP = async ({ emailId }) => {
        try {
            setIsLoading(true);
            const data = await authService.resendOTP({ emailId });
            return { success: true, data };
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "Resending OTP failed";
            return { success: false, statusCode, message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
        } catch (err) {
            // Ignore logout API errors, clear local state
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const updateProfile = async ({ userName, emailId }) => {
        try {
            setIsLoading(true);
            setAuthError(null);
            const data = await authService.updateProfile({ userName, emailId });
            if (data && data.user) {
                setUser(data.user);
                return { success: true, data };
            }
            return { success: false, message: data.message || "Failed to update profile" };
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "Failed to update profile";
            setAuthError({ statusCode, message });
            return { success: false, statusCode, message };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                initializing,
                authError,
                setAuthError,
                login,
                register,
                verifyOTP,
                resendOTP,
                logout,
                checkAuthStatus,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
