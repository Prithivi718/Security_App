import * as React from "react";
import { cn } from "../../lib/utils.js";

const Checkbox = React.forwardRef(
    ({ className, checked, onChange, disabled, id, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className={cn(
                        "peer size-4 shrink-0 appearance-none rounded border border-[#D4D4D4] bg-[#FFFFFF] checked:border-[#111111] checked:bg-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2B2B] disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
                        className
                    )}
                    {...props}
                />
                <svg
                    className="pointer-events-none absolute size-3.5 left-[1px] top-[1px] stroke-[#FFFFFF] opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3.5"
                    stroke="currentColor"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
