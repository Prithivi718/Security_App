import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Separator } from "../components/ui/separator.jsx";

export const DashboardPage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen w-full bg-[#F9F9F9] p-6 font-sans text-[#111111] flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col gap-6">
                <header className="flex items-center justify-between py-4 border-b border-[#E5E5E5]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center font-bold text-lg select-none">
                            {user?.userName?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-[#111111]">SecureNet System</h1>
                            <p className="text-xs text-[#666666]">Authenticated Environment</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={logout}
                        className="text-xs font-medium border-[#D4D4D4] text-[#111111] hover:bg-[#F5F5F5]"
                    >
                        Sign Out
                    </Button>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <Card className="md:col-span-2 shadow-sm p-6 flex flex-col gap-4 bg-[#FFFFFF] border-[#D4D4D4]">
                        <CardHeader className="p-0">
                            <CardTitle className="text-xl font-semibold text-[#111111]">User Profile</CardTitle>
                            <CardDescription className="text-[#666666]">Your active security session parameters.</CardDescription>
                        </CardHeader>
                        <Separator className="bg-[#E5E5E5]" />
                        <CardContent className="p-0 flex flex-col gap-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                                <span className="text-[#666666]">Username:</span>
                                <span className="font-mono font-medium text-[#111111]">{user?.userName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                                <span className="text-[#666666]">Email Address:</span>
                                <span className="font-mono font-medium text-[#111111]">{user?.emailId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                                <span className="text-[#666666]">Role:</span>
                                <span className="font-semibold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-[#E5E5E5] text-[#111111]">
                                    {user?.role || "User"}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                                <span className="text-[#666666]">Email Verified:</span>
                                <span className="font-medium text-[#111111]">
                                    {user?.emailVerified ? "Verified (Active)" : "Pending"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm p-6 flex flex-col gap-4 bg-[#FFFFFF] border-[#D4D4D4]">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg font-semibold text-[#111111]">Session Status</CardTitle>
                            <CardDescription className="text-[#666666]">Active encryption token</CardDescription>
                        </CardHeader>
                        <Separator className="bg-[#E5E5E5]" />
                        <CardContent className="p-0 flex flex-col gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-[#F5F5F5] border border-[#D4D4D4] flex items-center gap-2 font-mono text-[#111111]">
                                <span className="size-2 rounded-full bg-[#111111] animate-pulse" />
                                <span>State: Authenticated</span>
                            </div>
                            <p className="text-[#666666] leading-relaxed">
                                Authentication state successfully verified with cookie credentials.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
