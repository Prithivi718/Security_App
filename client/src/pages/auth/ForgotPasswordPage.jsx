import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service.js";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs.jsx";

import { RiUserFill } from "@remixicon/react";

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("forgot");
    const [emailId, setEmailId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!emailId) {
            setMessage("Please enter your email address.");
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.forgotPassword({ emailId: emailId.trim() });
            setIsSuccess(true);
            setMessage(
                data.message || "If an account exists, a reset link has been sent to your email."
            );
        } catch (err) {
            setIsSuccess(true);
            setMessage("If an account exists, a reset link has been sent to your email.");
        } finally {
            setIsLoading(false);
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
                            Account Recovery
                        </CardTitle>
                        <CardDescription className="text-[#666666] tracking-[-0.006em]">
                            Request a secure password reset link for your account.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator className="bg-[#E5E5E5]" />

                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={(val) => {
                        if (val === "reset" && isSuccess) {
                            navigate("/reset-password");
                        } else {
                            setActiveTab(val);
                        }
                    }}>
                        <TabsList className="bg-[#E5E5E5]">
                            <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
                            <TabsTrigger value="reset" disabled={!isSuccess}>
                                Reset Password
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="forgot" className="mt-4">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {message && (
                                    <div
                                        className={`p-3 rounded-lg text-xs font-medium border text-center ${isSuccess
                                            ? "bg-[#F5F5F5] border-[#D4D4D4] text-[#111111]"
                                            : "bg-[#111111] border-[#2B2B2B] text-[#FFFFFF]"
                                            }`}
                                    >
                                        {message}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="emailId" className="text-[#111111] font-medium text-xs">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="emailId"
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={emailId}
                                        onChange={(e) => setEmailId(e.target.value)}
                                        className="rounded-lg border-[#D4D4D4] bg-[#FFFFFF] text-[#111111]"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium"
                                >
                                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                                </Button>

                                <div className="flex justify-between items-center text-xs text-[#2B2B2B] mt-2">
                                    <Link to="/login" className="hover:text-[#111111] underline underline-offset-4">
                                        Back to Sign in
                                    </Link>
                                    <Link to="/register" className="hover:text-[#111111]">
                                        Create account
                                    </Link>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="reset" className="mt-4">
                            <div className="flex flex-col gap-4 text-center">
                                <div className="p-3 rounded-lg text-xs font-medium border bg-[#F5F5F5] border-[#D4D4D4] text-[#111111]">
                                    A reset link was sent to your email. Click the link in the email to open the reset password page.
                                </div>
                                <Link to="/reset-password">
                                    <Button className="w-full bg-[#111111] text-[#FFFFFF] hover:bg-[#2B2B2B] font-medium">
                                        Go to Reset Password
                                    </Button>
                                </Link>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
