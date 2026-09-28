import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { cn } from "../../lib/utils.js";

const OTP_LENGTH = 6;
const DEFAULT_COUNTDOWN = 60;

export const OTPVerificationModal = ({
    isOpen,
    email,
    onVerify,
    onResend,
    onClose,
    isLoading = false,
    error = "",
    successMessage = ""
}) => {
    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
    const [countdown, setCountdown] = useState(DEFAULT_COUNTDOWN);
    const [localError, setLocalError] = useState("");
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            setDigits(Array(OTP_LENGTH).fill(""));
            setCountdown(DEFAULT_COUNTDOWN);
            setLocalError("");
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        let timer = null;
        if (isOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isOpen, countdown]);

    if (!isOpen) return null;

    const handleDigitChange = (index, value) => {
        setLocalError("");
        const cleanVal = value.replace(/[^0-9]/g, "");
        if (!cleanVal) {
            const updated = [...digits];
            updated[index] = "";
            setDigits(updated);
            return;
        }

        const digit = cleanVal.slice(-1);
        const updated = [...digits];
        updated[index] = digit;
        setDigits(updated);

        if (index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        setLocalError("");
        const pasteData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
        if (!pasteData) return;

        const pastedArray = pasteData.slice(0, OTP_LENGTH).split("");
        const updated = [...digits];
        pastedArray.forEach((char, idx) => {
            updated[idx] = char;
        });
        setDigits(updated);

        const nextFocusIndex = Math.min(pastedArray.length, OTP_LENGTH - 1);
        inputRefs.current[nextFocusIndex]?.focus();
    };

    const isComplete = digits.every((d) => d !== "");
    const otpCode = digits.join("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isComplete || isLoading) return;
        onVerify(otpCode);
    };

    const handleResendClick = async () => {
        if (countdown > 0 || isLoading) return;
        setLocalError("");
        setDigits(Array(OTP_LENGTH).fill(""));
        setCountdown(DEFAULT_COUNTDOWN);
        inputRefs.current[0]?.focus();
        if (onResend) {
            await onResend();
        }
    };

    const displayError = error || localError;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50 duration-200">
            <Card className="w-full max-w-[440px] shadow-xl p-5 md:p-8 bg-[#FFFFFF] border-[#D4D4D4]">
                <CardHeader className="flex flex-col items-center text-center p-0 gap-2 mb-6">
                    <CardTitle className="text-xl font-semibold text-[#111111]">
                        Verification Required
                    </CardTitle>
                    <CardDescription className="text-sm text-[#2B2B2B]">
                        We sent a 6-digit code to{" "}
                        <span className="font-mono font-medium text-[#111111]">
                            {email}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                            {digits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className={cn(
                                        "w-12 h-14 text-center text-xl font-mono font-semibold rounded-lg border border-[#D4D4D4] bg-[#FFFFFF] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#2B2B2B] transition-all select-none",
                                        digit ? "border-[#111111]" : ""
                                    )}
                                />
                            ))}
                        </div>

                        {displayError && (
                            <div className="p-3 rounded-lg bg-[#111111] border border-[#2B2B2B] text-xs font-medium text-[#FFFFFF] text-center">
                                {displayError}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-lg bg-[#F5F5F5] border border-[#D4D4D4] text-xs font-medium text-[#111111] text-center">
                                {successMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={!isComplete || isLoading}
                                className="w-full h-11 font-medium bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B]"
                            >
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>

                            <div className="flex items-center justify-between text-xs text-[#2B2B2B] px-1">
                                <span>
                                    {countdown > 0
                                        ? `Resend code in ${countdown}s`
                                        : "Didn't receive code?"}
                                </span>

                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    disabled={countdown > 0 || isLoading}
                                    onClick={handleResendClick}
                                    className="p-0 text-xs font-medium text-[#111111] hover:underline"
                                >
                                    {countdown > 0 ? "Wait timer" : "Resend OTP"}
                                </Button>
                            </div>
                        </div>

                        {onClose && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="w-full text-xs text-[#111111] hover:bg-[#F5F5F5]"
                            >
                                Cancel
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default OTPVerificationModal;
