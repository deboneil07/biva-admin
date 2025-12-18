import { Hono } from "hono";
import { auth } from "./lib/auth";
import adminSignupRouter from "./temp-admin";
import { cors } from "hono/cors";
import { adminRouter } from "./controller/adminRouter";
import { serve } from "bun";
import { getBookingsRouter } from "./controller/getBookings";
import { eventRouter } from "./controller/eventController";
import {
  deleteMediaController,
  getImage,
  uploadImageVideoController,
} from "./controller/imageController";
import { hotelRouter } from "./controller/hotelController";
import getTickets from "./utils/get-tickets";

const app = new Hono();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
// app.route("/dev", adminSignupRouter);
app.route("/admin", adminRouter);
app.get("/get-media/:folder", getImage);
app.route("/get-bookings", getBookingsRouter);
app.post("/upload-media", uploadImageVideoController);
app.post("/delete-media", deleteMediaController);
app.route("/event", eventRouter);
app.route("/room", hotelRouter);

app.get("/ticket", getTickets);

serve({
  fetch: app.fetch,
  port: 3000,
});
