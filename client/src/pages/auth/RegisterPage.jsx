import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
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
import OTPVerificationModal from "../../components/auth/OTPVerificationModal.jsx";

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, verifyOTP, resendOTP } = useAuth();

    const [userName, setUserName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const toggleVisibility = () => setIsVisible((prev) => !prev);
    const toggleConfirmVisibility = () => setIsConfirmVisible((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!userName || !emailId || !password || !confirmPassword) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (userName.trim().length < 3 || userName.trim().length > 30) {
            setErrorMessage("Username must be between 3 and 30 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const result = await register({
            userName: userName.trim(),
            emailId: emailId.trim(),
            password,
        });
        setIsLoading(false);

        if (result.success) {
            setShowOtpModal(true);
        } else {
            if (result.statusCode === 409) {
                setErrorMessage("Username or email is already registered.");
            } else {
                setErrorMessage(result.message || "Registration failed. Please check your inputs.");
            }
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        setOtpError("");
        setOtpLoading(true);
        const result = await verifyOTP({ emailId: emailId.trim(), otp: otpCode });
        setOtpLoading(false);

        if (result.success) {
            setShowOtpModal(false);
            navigate("/app/chats");
        } else {
            setOtpError(result.message || "Invalid or expired OTP.");
        }
    };

    const handleResendOtp = async () => {
        setOtpError("");
        const result = await resendOTP({ emailId: emailId.trim() });
        if (!result.success) {
            setOtpError(result.message || "Failed to resend OTP.");
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
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-[#666666] tracking-[-0.006em]">
                            Enter your details below to set up your SecureNet identity.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator className="bg-[#E5E5E5]" />

                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {errorMessage && (
                            <div className="p-3 rounded-lg text-xs font-medium border bg-[#111111] text-[#FFFFFF] border-[#2B2B2B] text-center">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="userName" className="text-[#111111] font-medium text-xs">
                                Username
                            </Label>
                            <Input
                                id="userName"
                                type="text"
                                placeholder="Choose a username"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="emailId" className="text-[#111111] font-medium text-xs">
                                Email
                            </Label>
                            <Input
                                id="emailId"
                                type="email"
                                placeholder="Enter your email"
                                value={emailId}
                                onChange={(e) => setEmailId(e.target.value)}
                                className="rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="text-[#111111] font-medium text-xs">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    className="pe-9 rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                    placeholder="Create password"
                                    type={isVisible ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            <PasswordStrengthMeter password={password} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword" className="text-[#111111] font-medium text-xs">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    className="pe-9 rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                    placeholder="Repeat password"
                                    type={isConfirmVisible ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            disabled={isLoading}
                            className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium mt-2"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>

                        <div className="text-center text-xs text-[#2B2B2B] mt-2">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-[#111111] underline underline-offset-4">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <OTPVerificationModal
                isOpen={showOtpModal}
                email={emailId}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onClose={() => setShowOtpModal(false)}
                isLoading={otpLoading}
                error={otpError}
            />
        </div>
    );
};

export default RegisterPage;
