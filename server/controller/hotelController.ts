import { Hono, type Context } from "hono";
import { db } from "../db";
import type { UploadFileResult } from "../utils/cloudinary-service";
import { deleteMediaFunction, uploadMediaMethod } from "./imageController";
import { adminHotelRoomReservation } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { convertUrlsToPublicId } from "../utils/getPublicIdFromUrl";

export const hotelRouter = new Hono();

hotelRouter.get("/type-of-rooms", async (c: Context) => {});

hotelRouter.post("/create", async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    console.log(body);

    const room_number =
      typeof body["room_number"] === "string" ? body["room_number"] : null;
    const room_type =
      typeof body["room_type"] === "string" ? body["room_type"] : null;
    const floor =
      typeof body["floor"] === "string" ? parseInt(body["floor"]) : null;
    const occupancy =
      typeof body["occupancy"] === "string"
        ? parseInt(body["occupancy"])
        : null;
    const description =
      typeof body["description"] === "string" ? body["description"] : null;
    const price =
      typeof body["price"] === "string" ? parseInt(body["price"]) : null;
    const occupied =
      typeof body["occupied"] === "string" ? body["occupied"] === "true" : null;
    const hotel_image =
      body["file"] instanceof File ? (body["file"] as File) : null;
    const position =
      typeof body["position"] === "string" ? body["position"] : null;
    if (
      room_number === null ||
      room_type === null ||
      floor === null ||
      occupancy === null ||
      price === null ||
      occupied === null ||
      hotel_image === null
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const uploadHotelImage: UploadFileResult | undefined =
      await uploadMediaMethod(hotel_image, "hotel-rooms", {
        price: price.toString(),
        description: description || "",
        room_type: room_type! || "",
        room_number: room_number! || "",
        position: position || "",
      });

    if (!uploadHotelImage?.secure_url || !uploadHotelImage?.optimized_url) {
      return c.json({ error: "Failed to upload hotel image" }, 500);
    }

    const newRoom = await db
      .insert(adminHotelRoomReservation)
      .values({
        roomNumber: room_number,
        typeOfRoom: room_type!,
        floor: floor,
        occupancy: occupancy,
        price: price,
        occupied: occupied,
        roomImage: uploadHotelImage.optimized_url,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Hotel room created successfully",
        room: newRoom[0],
      },
      201,
    );
  } catch (error) {
    console.error("Error creating hotel room:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

hotelRouter.delete("/delete", async (c: Context) => {
  try {
    const body = await c.req.json();

    const room_numbers: string[] = body["room_numbers"];
    if (
      !room_numbers ||
      !Array.isArray(room_numbers) ||
      room_numbers.length === 0
    ) {
      return c.json(
        { error: "Invalid or empty array of event IDs provided." },
        400,
      );
    }
    const deletedRooms = await db
      .delete(adminHotelRoomReservation)
      .where(inArray(adminHotelRoomReservation.roomNumber, room_numbers))
      .returning({
        room_number: adminHotelRoomReservation.roomNumber,
        room_image: adminHotelRoomReservation.roomImage,
      });

    if (deletedRooms.length === 0) {
      return c.json(
        { error: "No hotel rooms found with the provided room numbers." },
        404,
      );
    }

    const publicIdPromises = deletedRooms.map((room) => {
      return convertUrlsToPublicId(room.room_image);
    });

    const resolvedPublicIds = await Promise.all(publicIdPromises);
    const imagesToDelete: string[] = resolvedPublicIds.filter(
      (id): id is string => id !== null && id !== undefined,
    );

    const deletedRoomImages = await deleteMediaFunction(imagesToDelete);
    return c.json(
      {
        success: true,
        message: `${deletedRooms.length} hotel rooms deleted successfully`,
        deleted_count: deletedRooms.length,
        deleted_rooms: deletedRooms.map((room) => room.room_number),
        deleted_img: deletedRoomImages,
      },
      200,
    );
  } catch (err: any) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
