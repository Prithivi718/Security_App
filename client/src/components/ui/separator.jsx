import * as React from "react";
import { cn } from "../../lib/utils.js";

const Separator = React.forwardRef(
    ({ className, orientation = "horizontal", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "shrink-0 bg-[#E5E5E5] dark:bg-[#2B2B2B]",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
);
Separator.displayName = "Separator";

export { Separator };
