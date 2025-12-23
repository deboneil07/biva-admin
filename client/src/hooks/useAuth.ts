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


    async function signIn(email: string, password: string) {
        signInSetLoading(true);
        signInSetError(null);
        try {
            const { data, error } = await authClient.signIn.email({
                email: email,
                password: password,
                callbackURL: 'http://localhost:5174/dashboard',
                // 'https://biva-admin.onrender.com/dashboard'
            })
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
                    }
                }
            })
        } catch (err) {
            signOutSetError(err)
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
        sessionLoading

    }
}