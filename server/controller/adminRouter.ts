import { Hono } from "hono"
import { hasRole, isAuthenticated, type UserRole } from "../middleware/auth";
import { auth } from "../lib/auth";
import { db } from "../db";
import { user } from "../db/auth-schema";
import { desc, eq } from "drizzle-orm";

export const adminRouter = new Hono();

adminRouter.post("/create-user", isAuthenticated, hasRole(['admin']), async (c) => {
    const body = await c.req.json() as {
        name: string,
        email: string,
        password: string,
        role: UserRole
    };

    try {
        const newUser = await auth.api.createUser({
            body: {
                name: body.name,
                email: body.email,
                password: body.password,
                data: {
                    role: body.role,
                }
            },

            headers: c.req.raw.headers,
        });

        return c.json({
            message: `User ${body.email} created successfully with role ${body.role}.`,
            user: {
                id: newUser.user.id,
                email: newUser.user.email,
                role: body.role,
            }
        }, 201);
    } catch (error: any) {
        console.error("Better Auth User Creation Failure:", error);
        console.error("Error Message:", error.message);
        console.error("Error Status Code:", error.statusCode);
        return c.json({
            error: "User creation failed",
            message: error.message
        }, 400);
    }
})

adminRouter.delete("/delete-user/:id", isAuthenticated, hasRole(['admin']), async (c) => {
    const userId = c.req.param('id');

    try {
        await auth.api.removeUser({
            body: {
                userId: userId
            },
            headers: c.req.raw.headers,
        })

        return c.json({ message: `User ${userId} deleted successfully` }, 200);
    } catch (error) {
        console.error("Error deleting user:", error);
        return c.json({ error: "Failed to delete user" }, 500);
    }
});

adminRouter.get("/get-users", isAuthenticated, hasRole(['admin']), async (c) => {
    try {
        const allUsers = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        }).from(user).orderBy(desc(user.createdAt))

        return c.json({
            count: allUsers.length,
            users: allUsers
        })
    } catch (error) {
        console.error("Error fetching users:", error);
        return c.json({ error: "Failed to retrieve user list." }, 500);
    }

})

adminRouter.put('/edit-roles', isAuthenticated, hasRole(['admin']), async (c) => {
    const { userId, newRole } = await c.req.json() as {
        userId: string,
        newRole: UserRole,
    }

    try {
        await db.update(user).set({ role: newRole }).where(eq(user.id, userId));

        return c.json({
            message: `Role for user ID ${userId} successfully updated to ${newRole}.`
        }, 200);
    } catch (error: any) {
        console.error("Role update error:", error);

        return c.json({
            error: "Role update failed",
            message: error.message || "An unknown error occurred during role update."
        }, 400);
    }
})