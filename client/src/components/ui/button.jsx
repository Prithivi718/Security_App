import * as React from "react";
import { cn } from "../../lib/utils.js";

const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2B2B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

        const variants = {
            default: "bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B]",
            secondary: "bg-[#D4D4D4] text-[#111111] hover:bg-[#B3B3B3]",
            outline: "border border-[#D4D4D4] bg-transparent text-[#111111] hover:bg-[#F5F5F5]",
            ghost: "hover:bg-[#F5F5F5] text-[#111111]",
            link: "text-[#111111] underline-offset-4 hover:underline p-0 h-auto font-normal",
            danger: "bg-[#2B2B2B] border border-[#666666] text-[#FFFFFF] hover:bg-[#111111]"
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0"
        };

        return (
            <button
                type={type}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
