import React, { useMemo } from "react";
import { cn } from "../../lib/utils.js";

export const evaluatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", percent: 20 };
    if (score === 2) return { score: 2, label: "Fair", percent: 40 };
    if (score === 3) return { score: 3, label: "Good", percent: 60 };
    if (score === 4) return { score: 4, label: "Strong", percent: 80 };
    return { score: 5, label: "Very Strong", percent: 100 };
};

export const PasswordStrengthMeter = ({ password, className }) => {
    const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

    if (!password) return null;

    return (
        <div className={cn("flex flex-col gap-1.5 mt-1 select-none", className)}>
            <div className="flex items-center justify-between text-xs font-medium text-[#666666] dark:text-[#A3A3A3]">
                <span>Password strength</span>
                <span className="font-semibold text-[#111111] dark:text-[#F5F5F5]">
                    {strength.label}
                </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-[#E5E5E5] dark:bg-[#2B2B2B] overflow-hidden">
                <div
                    className="h-full bg-[#111111] dark:bg-[#F5F5F5] transition-all duration-300 rounded-full"
                    style={{ width: `${strength.percent}%` }}
                />
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
