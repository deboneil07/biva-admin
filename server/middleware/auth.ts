import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

export const isAuthenticated = createMiddleware(async (c, next) => {
    try {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        console.log("Authenticated User Role:", session?.user); 

        c.set('user', session?.user);
        c.set('session', session);

        await next();
    } catch (error) {
        // 4. If session is invalid (expired, missing, or corrupt), deny access
        return c.json({
            error: "Unauthorized",
            message: "Authentication required to access this resource."
        }, 401);
    }
});

export type UserRole = 'admin' | 'employee' | 'media-handler';
export interface User {
    id: string;
    email: string;
    role: UserRole;
}

declare module 'hono' {
    interface ContextRenderer {
        user: User;
        session: any;
    }
}

/** 
* @param allowedRoles
**/
export const hasRole = (allowedRoles: UserRole[]) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user');

        if (!user || !allowedRoles.includes(user.role)) {
            return c.json({
                error: "Forbidden",
                message: "You do not have the required role to perform this action."
            }, 403);
        }
        await next();
    });
}