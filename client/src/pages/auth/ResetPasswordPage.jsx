import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/auth.service.js";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Separator } from "../../components/ui/separator.jsx";
import { Button } from "../../components/ui/button.jsx";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { RiUserFill } from "@remixicon/react";
import PasswordStrengthMeter from "../../components/auth/PasswordStrengthMeter.jsx";

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const emailId = searchParams.get("emailId") || "";
    const token = searchParams.get("token") || "";

    const [isValidating, setIsValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [validationError, setValidationError] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const toggleVisibility = () => setIsVisible((prev) => !prev);
    const toggleConfirmVisibility = () => setIsConfirmVisible((prev) => !prev);

    useEffect(() => {
        const validateToken = async () => {
            if (!emailId || !token) {
                setIsValidating(false);
                setIsTokenValid(false);
                setValidationError("Invalid password reset link. Missing required parameters.");
                return;
            }

            try {
                setIsValidating(true);
                const res = await authService.validateResetToken({ emailId, token });
                if (res && res.valid) {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                    setValidationError("Reset token is invalid or has expired.");
                }
            } catch (err) {
                setIsTokenValid(false);
                setValidationError(err.message || "Reset token is invalid or has expired.");
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [emailId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!newPassword || !confirmPassword) {
            setFormError("Both password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await authService.resetPassword({
                emailId,
                token,
                newPassword,
            });

            setSuccessMessage(res.message || "Password reset successful! You can now log in.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setFormError(err.message || "Failed to reset password. Token may have expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9F9] p-4 font-sans text-[#111111]">
            <Card className="flex w-full max-w-[460px] shadow-sm flex-col gap-6 p-5 md:p-8 bg-[#FFFFFF] border-[#D4D4D4]">
                <CardHeader className="flex flex-col items-center gap-2 p-0">
                    <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full bg-[#E5E5E5] md:size-20">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#111111] text-[#FFFFFF] shadow-sm md:size-14">
                            <RiUserFill className="size-6 text-[#FFFFFF] md:size-7" />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1.5 text-center">
                        <CardTitle className="md:text-xl font-semibold text-[#111111]">
                            Set New Password
                        </CardTitle>
                        <CardDescription className="text-[#666666] tracking-[-0.006em]">
                            Choose a strong, unique password for your account.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator className="bg-[#E5E5E5]" />

                <CardContent className="p-0">
                    {isValidating ? (
                        <div className="py-8 text-center text-sm font-medium text-[#111111]">
                            Validating reset token...
                        </div>
                    ) : !isTokenValid ? (
                        <div className="flex flex-col gap-4 text-center">
                            <div className="p-4 rounded-lg bg-[#111111] text-[#FFFFFF] border border-[#2B2B2B] text-xs font-medium">
                                {validationError}
                            </div>
                            <Link to="/forgot-password">
                                <Button className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B]">
                                    Request New Reset Link
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {successMessage && (
                                <div className="p-3 rounded-lg text-xs font-medium border bg-[#F5F5F5] border-[#D4D4D4] text-[#111111] text-center">
                                    {successMessage}
                                </div>
                            )}

                            {formError && (
                                <div className="p-3 rounded-lg text-xs font-medium border bg-[#111111] text-[#FFFFFF] border-[#2B2B2B] text-center">
                                    {formError}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="newPassword" className="text-[#111111] font-medium text-xs">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={isVisible ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pe-9 rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                        required
                                    />
                                    <button
                                        className="text-[#666666] hover:text-[#111111] absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-none cursor-pointer"
                                        type="button"
                                        onClick={toggleVisibility}
                                        aria-label={isVisible ? "Hide password" : "Show password"}
                                    >
                                        {isVisible ? (
                                            <EyeOffIcon size={16} aria-hidden="true" />
                                        ) : (
                                            <EyeIcon size={16} aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                <PasswordStrengthMeter password={newPassword} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirmPassword" className="text-[#111111] font-medium text-xs">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={isConfirmVisible ? "text" : "password"}
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pe-9 rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                        required
                                    />
                                    <button
                                        className="text-[#666666] hover:text-[#111111] absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-none cursor-pointer"
                                        type="button"
                                        onClick={toggleConfirmVisibility}
                                        aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                                    >
                                        {isConfirmVisible ? (
                                            <EyeOffIcon size={16} aria-hidden="true" />
                                        ) : (
                                            <EyeIcon size={16} aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium mt-2"
                            >
                                {isSubmitting ? "Updating Password..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
