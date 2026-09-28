import * as React from "react";
import { cn } from "../../lib/utils.js";

const TabsContext = React.createContext({
    value: "",
    onValueChange: () => { }
});

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

    React.useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleValueChange = (val) => {
        setSelectedValue(val);
        if (onValueChange) {
            onValueChange(val);
        }
    };

    return (
        <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
            <div className={cn("w-full flex flex-col gap-4", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                "inline-flex h-11 items-center justify-center rounded-lg bg-[#E5E5E5] p-1 text-[#666666] w-full select-none",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const TabsTrigger = ({ value, disabled, className, children, ...props }) => {
    const context = React.useContext(TabsContext);
    const isSelected = context.value === value;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 flex-1 cursor-pointer",
                isSelected
                    ? "bg-[#FFFFFF] text-[#111111] shadow-xs"
                    : "hover:text-[#111111]",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, className, children, ...props }) => {
    const context = React.useContext(TabsContext);
    if (context.value !== value) return null;

    return (
        <div
            className={cn(
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
