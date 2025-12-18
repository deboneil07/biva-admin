import type { Context } from "hono";
import { Hono } from "hono";
import { type UploadFileResult } from "../utils/cloudinary-service";
import { deleteMediaFunction, uploadMediaMethod } from "./imageController";
import { db } from "../db";
import { adminEventTable } from "../drizzle/schema";
import { generate_uuid } from "../utils/uuid";
import { eq, inArray } from "drizzle-orm";
import { convertUrlsToPublicId } from "../utils/getPublicIdFromUrl";

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

eventRouter.patch("/update/:id", async (c: Context) => {
  try {
    const event_id = c.req.param("id");
    const body = await c.req.parseBody();

    const updates: any = {}
    if (typeof body["event_name"] == "string") updates.event_name = body["event_name"];
    if (typeof body["group_name"] == "string") updates.group_name = body["group_name"];
    if (typeof body["date"] == "string") updates.date = body["date"];
    if (typeof body["time"] == "string") updates.time = body["time"];
    if (typeof body["price"] == "string") updates.price = body["price"];

    if (Object.keys(updates).length == 0) {
      return c.json({ error: "no fields provided for updation!" }, 400);
    }

    const res = await db.update(adminEventTable).set(updates).where(eq(adminEventTable.eventId, event_id)).returning();
    if (res.length == 0) {
      return c.json({ error: "event not found!" }, 404);
    }

    return c.json({
      success: true,
      message: "updated successfully",
      event: res[0],
    })
  } catch (err) {
    console.error(err);
    return c.json({ error: err }, 500);
  }
})

eventRouter.delete("/delete", async (c: Context) => {
  try {
    const body = await c.req.json();
    const eventIdsToDelete: string[] = body["ids"];

    if (
      !eventIdsToDelete ||
      !Array.isArray(eventIdsToDelete) ||
      eventIdsToDelete.length === 0
    ) {
      return c.json(
        { error: "Invalid or empty array of event IDs provided." },
        400,
      );
    }

    const deletedEvents = await db
      .delete(adminEventTable)
      .where(inArray(adminEventTable.eventId, eventIdsToDelete))
      .returning({
        event_id: adminEventTable.eventId,
        event_name: adminEventTable.eventName,
        event_img: adminEventTable.banner,
      });

    if (deletedEvents.length === 0) {
      return c.json(
        {
          success: true,
          message: "No events found for the provided IDs. Nothing was deleted.",
          deleted_count: 0,
        },
        200,
      );
    }

    const publicIdPromises = deletedEvents.map((eve) =>
      convertUrlsToPublicId([eve.event_img]),
    );
    const resolvedPublicIds = await Promise.all(publicIdPromises);
    const imagesToDelete: string[] = resolvedPublicIds
      .flat()
      .filter((id): id is string => id !== null && id !== undefined);

    const deletedImages = await deleteMediaFunction(imagesToDelete);

    return c.json(
      {
        success: true,
        message: `${deletedEvents.length} events deleted successfully`,
        deleted_count: deletedEvents.length,
        deleted_events: deletedEvents.map((e) => e.event_id),
        deleted_img: deletedImages,
      },
      200,
    );
  } catch (err: any) {
    console.error("Error deleting events:", err);
    return c.json({ error: "Failed to delete events" }, 500);
  }
});
