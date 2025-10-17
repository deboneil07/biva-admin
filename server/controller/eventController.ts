import type { Context } from "hono";
import { Hono } from "hono";
import { type UploadFileResult } from "../utils/cloudinary-service";
import { uploadMediaMethod } from "./imageController";
import { db } from "../db";
import { adminEventTable } from "../drizzle/schema";
import { generate_uuid } from "../utils/uuid";

export const eventRouter = new Hono();

eventRouter.post("/create", async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    console.log(body);
    const event_name = typeof body["name"] === "string" ? body["name"] : null;
    const group_name =
      typeof body["group_name"] === "string" ? body["group_name"] : null;
    const ticket_price_str =
      typeof body["price"] === "string" ? body["price"] : null;
    const date = typeof body["date"] === "string" ? body["date"] : null;
    const time = typeof body["time"] === "string" ? body["time"] : null;
    const image = body["file"] instanceof File ? (body["file"] as File) : null;

    if (
      event_name === null ||
      group_name === null ||
      ticket_price_str === null ||
      date === null ||
      time === null ||
      image === null
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const uuid = generate_uuid();

    const uploadBanner: UploadFileResult | undefined = await uploadMediaMethod(
      image,
      "events",
      {
        event_id: uuid,
        position: "events",
        event_name: event_name,
        ticket_price: ticket_price_str,
        date: date,
        time: time,
        group_name: group_name,
      },
    );
    if (!uploadBanner?.secure_url) {
      return c.json(
        { Error: "Failed to upload image or secure URL is missing!" },
        500,
      );
    }

    const banner = uploadBanner.optimized_url || uploadBanner.secure_url;
    const newEvent = await db
      .insert(adminEventTable)
      .values({
        eventId: uuid,
        eventName: event_name,
        groupName: group_name,
        ticketPrice: parseInt(ticket_price_str),
        date: date,
        time: time,
        banner: banner,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Event created successfully",
        event: newEvent[0],
      },
      201,
    );
  } catch (err: any) {
    console.error(err);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

eventRouter.delete("/delete", async (c: Context) => {
  const eventToDelete = await c.req.json();
  if (!eventToDelete) {
    return c.json({ error: "Missing event ID" }, 400);
  }

  const deleteEvent = await db
    .delete(adminEventTable)
    .where(eq(adminEventTable.event_id, eventToDelete));
});
