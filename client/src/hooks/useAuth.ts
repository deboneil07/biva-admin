import { authClient } from "@/utils/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
    const navigate = useNavigate();

    const [signInData, signInSetData] = useState<any>(null);
    const [signInError, signInSetError] = useState<any>(null);
    const [signInLoading, signInSetLoading] = useState<boolean>(false);

    const [signOutError, signOutSetError] = useState<any>(null);
    const [signOutLoading, signOutSetLoading] = useState<boolean>(false);

    const [user, setUser] = useState<any>(null);
    const [sessionLoading, sessionSetLoading] = useState<boolean>(false);

    const [resetLoading, setResetLoading] = useState<boolean>(false);
    const [resetError, setResetError] = useState<any>(null);

    async function requestPasswordReset(email: string) {
        setResetLoading(true);
        setResetError(null);
        console.log("Requesting password reset for:", email);

        try {
            const { data, error } = await authClient.forgetPassword.emailOtp({
                email,
            });
            console.log("Password reset response:", { data, error });
            if (error) {
                console.error("Password reset error:", error);
                setResetError(error);
                return false;
            }
            return true;
        } catch (err) {
            console.error("Password reset catch error:", err);
            setResetError(err);
            return false;
        } finally {
            setResetLoading(false);
        }
    }

    async function verifyAndResetPassword(
        email: string,
        otp: string,
        password: string,
    ) {
        setResetLoading(true);
        setResetError(null);
        console.log("Verifying OTP and resetting password for:", email);

        try {
            const { data, error } = await authClient.emailOtp.resetPassword({
                email,
                otp,
                password,
            });
            console.log("Reset password response:", { data, error });
            if (error) {
                console.error("Reset password error:", error);
                setResetError(error);
                return false;
            }
            return true;
        } catch (err) {
            console.error("Reset password catch error:", err);
            setResetError(err);
            return false;
        } finally {
            setResetLoading(false);
        }
    }

    async function signIn(email: string, password: string) {
        signInSetLoading(true);
        signInSetError(null);
        try {
            const { data, error } = await authClient.signIn.email({
                email: email,
                password: password,
                callbackURL: "https://biva-admin.onrender.com/dashboard",
                // 'https://biva-admin.onrender.com/dashboard'
            });
            data ? signInSetData(data) : signInSetError(error);
        } catch (err) {
            signInSetError(err);
        } finally {
            signInSetLoading(false);
        }
    }

    async function signOut() {
        signOutSetLoading(true);
        signOutSetError(null);

        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        navigate("/");
                    },
                },
            });
        } catch (err) {
            signOutSetError(err);
        } finally {
            signOutSetLoading(false);
        }
    }

    async function getSession() {
        sessionSetLoading(true);
        const data = await authClient.getSession();
        setUser(data?.data?.user);
        sessionSetLoading(false);
    }

    return {
        signIn,
        signInData,
        signInError,
        signInLoading,

        signOut,
        signOutError,
        signOutLoading,

        getSession,
        user,
        sessionLoading,

        requestPasswordReset,
        verifyAndResetPassword,
        resetLoading,
        resetError,
    };
}
