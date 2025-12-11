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

    const { signIn, signInData, signInError, signInLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        await signIn(email, password);
    };

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
        </form>
    );
}
