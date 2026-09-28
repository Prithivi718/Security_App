import React from "react";
import { SecureNetSidebar, SidebarProvider, SidebarInset, SidebarTrigger } from "../components/layout/SecureNetSidebar.jsx";
import { Separator } from "../components/ui/separator.jsx";

/**
 * AppLayout — root layout for all authenticated /app/* routes.
 *
 * Uses the shadcn/animate-ui SidebarProvider + SidebarInset pattern.
 * The Sidebar handles its own mobile sheet drawer internally.
 */
const AppLayout = ({ children }) => {
    return (
        <SidebarProvider defaultOpen={true}>
            <SecureNetSidebar />
            <SidebarInset>
                {/* Top bar with sidebar trigger */}
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#D4D4D4] bg-[#FFFFFF] px-4">
                    <SidebarTrigger className="-ml-1 text-[#111111] hover:bg-[#D4D4D4]" />
                    <Separator orientation="vertical" className="mr-2 h-4 bg-[#D4D4D4]" />
                    <span className="text-sm font-semibold text-[#111111] tracking-tight">
                        SecureNet
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
