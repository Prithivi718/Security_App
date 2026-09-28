import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import ChatsPage from "../pages/app/ChatsPage.jsx";
import UsersPage from "../pages/app/UsersPage.jsx";
import SettingsPage from "../pages/app/SettingsPage.jsx";

const PublicRoute = ({ children }) => {
    const { isAuthenticated, initializing } = useAuth();

    if (initializing) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFFFF] text-[#111111] font-mono text-xs">
                Initializing SecureNet session...
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/app/chats" replace />;
    }

    return children;
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initializing } = useAuth();

    if (initializing) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFFFF] text-[#111111] font-mono text-xs">
                Authenticating session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export const AppRoutes = () => {
    return (
        <Routes>
            {/* ── Public auth routes ── */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPasswordPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <PublicRoute>
                        <ResetPasswordPage />
                    </PublicRoute>
                }
            />

            {/* ── Legacy dashboard (keep alive so existing links don't 404) ── */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* ── Protected app shell with sidebar ── */}
            <Route
                path="/app"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Navigate to="/app/chats" replace />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/app/chats"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ChatsPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/app/users"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <UsersPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/app/settings"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <SettingsPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/app/chats" replace />} />
        </Routes>
    );
};

export default AppRoutes;
