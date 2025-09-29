import { Hono } from "hono";
import { auth } from "./lib/auth";

const adminSignupRouter = new Hono();

adminSignupRouter.post("/create-admin", async (c) => {
    const adminEmail = "admin@example.com";
    const adminPassword = "hotelbiva";
    const adminName = "System Administrator";

    try {
        await auth.api.signUpEmail({
            body: {
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            },
            request: c.req.raw,
            asResponse: false
        });

        return c.json({
            success: true,
            message: `Admin user ${adminEmail} created successfully with 'admin' role. DELETE THIS ROUTE NOW.`

        }, 201)
    } catch (error: any) {
        return c.json({
            success: false,
            message: `Admin creation failed: ${error.message}`
        }, error.status || 500);
    }
});

export default adminSignupRouter