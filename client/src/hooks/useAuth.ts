import { authClient } from "@/utils/auth";
import { useState } from "react";

export default function useAuth() {

    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    async function signIn(email: string, password: string) {
        const { data, error } =  await authClient.signIn.email({
            email: email,
            password: password,
            rememberMe: true,
            callbackURL: 'http://localhost:5173/dashboard'
        })
        data ? setData(data) : setError(error);
    }

    return {
        signIn,
        data,
        error
    }
}