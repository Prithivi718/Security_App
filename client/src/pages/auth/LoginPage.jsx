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
import { Checkbox } from "../../components/ui/checkbox.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Separator } from "../../components/ui/separator.jsx";
import { Button } from "../../components/ui/button.jsx";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { RiUserFill } from "@remixicon/react";
import OTPVerificationModal from "../../components/auth/OTPVerificationModal.jsx";

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, verifyOTP, resendOTP } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isUnverified, setIsUnverified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const toggleVisibility = () => setIsVisible((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email || !password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        if (isUnverified) {
            setShowOtpModal(true);
            return;
        }

        setIsLoading(true);
        const result = await login({ emailId: email, password });
        setIsLoading(false);

        if (result.success) {
            navigate("/dashboard");
        } else {
            if (result.statusCode === 403 && result.message?.toLowerCase().includes("verify")) {
                setIsUnverified(true);
                setErrorMessage("Please verify your email before logging in.");
                resendOTP({ emailId: email }).catch(() => { });
            } else if (result.statusCode === 423) {
                setErrorMessage(result.message || "Account temporarily locked. Try again later.");
            } else {
                setErrorMessage(result.message || "Invalid credentials.");
            }
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        setOtpError("");
        setOtpLoading(true);
        const result = await verifyOTP({ emailId: email, otp: otpCode });
        setOtpLoading(false);

        if (result.success) {
            setShowOtpModal(false);
            navigate("/dashboard");
        } else {
            setOtpError(result.message || "Invalid or expired OTP.");
        }
    };

    const handleResendOtp = async () => {
        setOtpError("");
        const result = await resendOTP({ emailId: email });
        if (!result.success) {
            setOtpError(result.message || "Failed to resend OTP.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9F9] p-4 font-sans text-[#111111]">
            <Card className="flex w-full max-w-[440px] shadow-sm flex-col gap-6 p-5 md:p-8 bg-[#FFFFFF] border-[#D4D4D4]">
                <CardHeader className="flex flex-col items-center gap-2 p-0">
                    <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full bg-[#E5E5E5] md:size-20">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#111111] text-[#FFFFFF] shadow-sm md:size-14">
                            <RiUserFill className="size-6 text-[#FFFFFF] md:size-7" />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1.5 text-center">
                        <CardTitle className="md:text-xl font-semibold text-[#111111]">
                            Sign in to your account
                        </CardTitle>
                        <CardDescription className="text-[#666666] tracking-[-0.006em]">
                            Enter your credentials to access your account.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator className="bg-[#E5E5E5]" />

                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {errorMessage && (
                            <div
                                className={`p-3 rounded-lg text-xs font-medium border text-center ${isUnverified
                                    ? "bg-[#F5F5F5] border-[#D4D4D4] text-[#111111]"
                                    : "bg-[#111111] border-[#2B2B2B] text-[#FFFFFF]"
                                    }`}
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="text-[#111111] font-medium text-xs">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsUnverified(false);
                                    setErrorMessage("");
                                }}
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
                                    placeholder="Password"
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
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="keep-me-logged-in"
                                    checked={keepLoggedIn}
                                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                                />
                                <Label
                                    htmlFor="keep-me-logged-in"
                                    className="block cursor-pointer text-xs text-[#111111]"
                                >
                                    Keep me logged in
                                </Label>
                            </div>
                            <Link to="/forgot-password">
                                <Button variant="link" size="sm" className="p-0 text-xs text-[#111111] hover:text-[#2B2B2B] font-medium">
                                    Forgot password?
                                </Button>
                            </Link>
                        </div>

                        {isUnverified ? (
                            <Button
                                type="button"
                                onClick={() => setShowOtpModal(true)}
                                className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium"
                            >
                                Verify OTP
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium"
                            >
                                {isLoading ? "Signing in..." : "Continue"}
                            </Button>
                        )}

                        <div className="text-center text-xs text-[#2B2B2B] mt-2">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-[#111111] underline underline-offset-4">
                                Create one
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <OTPVerificationModal
                isOpen={showOtpModal}
                email={email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onClose={() => setShowOtpModal(false)}
                isLoading={otpLoading}
                error={otpError}
            />
        </div>
    );
};

export default LoginPage;
