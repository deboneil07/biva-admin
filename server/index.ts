import { Hono } from "hono";
import { auth } from "./lib/auth";
import { serve } from "bun";
import adminSignupRouter from "./temp-admin";
import { adminRouter } from "./controller/adminRouter";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/dev", adminSignupRouter);
app.route("/admin", adminRouter);

serve({
    fetch: app.fetch,
    port: 3000
});