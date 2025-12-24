import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [view, setView] = useState<"login" | "forgot" | "reset">("login");

    console.log("LoginForm rendered, current view:", view);

    const { signIn, signInData, signInError, signInLoading, requestPasswordReset, verifyAndResetPassword, resetLoading, resetError } = useAuth();

    // All useEffect hooks must be called before any conditional returns
    useEffect(() => {
        if (signInData) {
            toast.success("Login successful!");
        }
    }, [signInData]);

    useEffect(() => {
        if (signInError) {
            toast.error(signInError.message || "Login failed");
        }
    }, [signInError]);

    const handleForgot = async ( e: React.FormEvent) => {
        console.log("=== handleForgot START ===");
        e.preventDefault();
        console.log('handleForgot called with email:', email);
        const success = await requestPasswordReset(email);
        console.log('requestPasswordReset result:', success);
        if (success) {
            toast.success("OTP sent to your email");
            setView("reset");
        } else {
            toast.error(resetError?.message || "Failed to send OTP");
        }
        console.log("=== handleForgot END ===");
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleReset called');
        const success = await verifyAndResetPassword(email, otp, password);
        console.log('verifyAndResetPassword result:', success);
        if (success) {
            toast.success("Password reset successful! Please login.");
            setView("login");
            setOtp("");
            setPassword("");
        } else {
            toast.error(resetError?.message || "Failed to reset password");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        await signIn(email, password);
    };

    // Conditional rendering after all hooks
    if (view === "forgot") {
        console.log("Rendering FORGOT PASSWORD form");
        return (
            <form className="flex flex-col gap-6" onSubmit={(e) => {
                console.log("Form submitted!");
                handleForgot(e);
            }}>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">Enter email. Admin will receive your code.</p>
                </div>
                <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Button type="submit" disabled={resetLoading}>
                    {resetLoading ? "Sending..." : "Request Code"}
                </Button>
                <Button variant="link" type="button" onClick={() => {
                    console.log("Back to Login clicked");
                    setView("login");
                }}>Back to Login</Button>
            </form>
        );
    }

    if (view === "reset") {
        return (
            <form className="flex flex-col gap-6" onSubmit={handleReset}>
                <div className="text-center"><h1 className="text-2xl font-bold">Reset Password</h1></div>
                <Input placeholder="OTP Code from Admin" value={otp} onChange={e => setOtp(e.target.value)} required />
                <Input placeholder="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <Button type="submit" disabled={resetLoading}>Reset Password</Button>
            </form>
        );
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                </p>
            </div>

            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={signInLoading}
                    />
                </div>

                <div className="grid gap-3 relative">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                    </div>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={signInLoading}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={signInLoading}
                >
                    {signInLoading && <Spinner />} Login
                </Button>
            </div>
            <Button 
                variant="link" 
                type="button" 
                onClick={() => {
                    console.log("Forgot Password button clicked!");
                    setView("forgot");
                }}
            > 
                Forgot Password? 
            </Button>
        </form>
    );
}
