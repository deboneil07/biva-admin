import { authClient } from "@/utils/auth";
import { useEffect, useState } from "react";

export type UserRole = "admin" | "employee" | "media-handler";

export function useUserRole() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchSession = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authClient.getSession();
            console.log("Direct auth session call:", response);

            if (response.data?.user) {
                setUser(response.data.user);
                setRole((response.data.user as any)?.role || null);
            } else {
                setUser(null);
                setRole(null);
            }
        } catch (err) {
            console.error("Session fetch error:", err);
            setError(err);
            setUser(null);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    return {
        user,
        role,
        isLoading,
        error,
        isAdmin: role === "admin",
        isEmployee: role === "employee",
        isMediaHandler: role === "media-handler",
        refetch: fetchSession,
    };
}
