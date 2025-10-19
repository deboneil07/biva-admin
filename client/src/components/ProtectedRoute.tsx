import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/utils/auth";
import { Loader2 } from "lucide-react";
import Unauthorized from "@/pages/unauthorized";

export type UserRole = "admin" | "employee" | "media-handler";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const response = await authClient.getSession();

                if (response.data?.user) {
                    setUser(response.data.user);
                    setRole((response.data.user as any)?.role || null);
                } else {
                    setUser(null);
                    setRole(null);
                }
            } catch (err) {
                console.error("Auth check error:", err);
                setError(err);
                setUser(null);
                setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 text-sm text-muted-foreground">
                    Checking authentication...
                </p>
            </div>
        );
    }

    // Redirect to login if no user
    if (!user || error) {
        console.log("No user or error, redirecting to login");
        return <Navigate to="/" replace />;
    }

    // Check if user's role is allowed
    if (role && !allowedRoles.includes(role)) {
        return <Unauthorized />;
    }

    return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["admin", "employee"]}>
            {children}
        </ProtectedRoute>
    );
}

export function MediaHandlerRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["admin", "media-handler"]}>
            {children}
        </ProtectedRoute>
    );
}
