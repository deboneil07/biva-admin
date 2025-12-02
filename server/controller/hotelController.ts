import { Hono, type Context } from "hono";
import { db } from "../db";
import type { UploadFileResult } from "../utils/cloudinary-service";
import {
  deleteMediaFunction,
  uploadMediaMethod,
  uploadMultipleMedia,
} from "./imageController";
import { adminHotelRoomReservation } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { convertUrlsToPublicId } from "../utils/getPublicIdFromUrl";

export const hotelRouter = new Hono();

hotelRouter.get("/type-of-rooms", async (c: Context) => {});

hotelRouter.post("/create", async (c: Context) => {
  try {
    // 1. Correctly parse the body as FormData
    const body = await c.req.parseBody();
    console.log("=== Incoming Request Body ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("===========================");

    // 2. Safely extract and type-cast string fields
    const room_type =
      typeof body["room_type"] === "string" ? body["room_type"] : null;
    const total_rooms =
      typeof body["total_rooms"] === "string"
        ? parseInt(body["total_rooms"], 10)
        : null;
    const occupancy =
      typeof body["occupancy"] === "string"
        ? parseInt(body["occupancy"], 10)
        : null;
    const description =
      typeof body["description"] === "string" ? body["description"] : null;
    const price =
      typeof body["price"] === "string" ? parseInt(body["price"], 10) : null;
    const position =
      typeof body["position"] === "string" ? body["position"] : null;

    const fileCount =
      typeof body["fileCount"] === "string"
        ? parseInt(body["fileCount"], 10)
        : 0;
    // 3. Correctly get the array of ALL files named "file"
    const allFiles = body["file"];
    const hotel_images: File[] = [];
    for (let i = 0; i < fileCount; i++) {
      const file = body[`file_${i}`];
      if (file instanceof File) {
        hotel_images.push(file);
        console.log(`Found file_${i}: ${file.name}`);
      }
    }

    // 4. Validate required fields
    if (
      !room_type ||
      occupancy === null ||
      price === null ||
      hotel_images.length === 0
    ) {
      return c.json(
        { error: "Missing required fields or no images provided." },
        400,
      );
    }

    console.log("BODY", body);
    console.log("HOTELIMAGES", hotel_images);
    // 5. Separate the first image from the "other" images
    const [primaryImage, ...otherImages] = hotel_images;
    console.log("HOTEL IMAGES LENGTH: ", hotel_images.length);
    console.log([primaryImage]);
    console.log(otherImages);

    // 6. Upload the primary image for the main database record
    const uploadPrimaryImage: UploadFileResult | undefined =
      await uploadMediaMethod(primaryImage, "hotel-rooms", {
        price: price.toString(),
        description: description || "",
        room_type: room_type,
        position: position || "",
      });

    if (!uploadPrimaryImage?.secure_url || !uploadPrimaryImage?.optimized_url) {
      return c.json({ error: "Failed to upload primary hotel image" }, 500);
    }

    // 7. Create the main room record in the database
    const newRoom = await db
      .insert(adminHotelRoomReservation)
      .values({
        typeOfRoom: room_type,
        occupancy: occupancy,
        price: price,
        roomImage: uploadPrimaryImage.optimized_url,
        totalRooms: total_rooms?.toString() ?? "", // Use nullish coalescing for safety
      })
      .returning();

    let otherImageUrls: string[] = [];
    if (otherImages.length > 0) {
      console.log(`Uploading ${otherImages.length} additional images...`);
      const uploadResults = await uploadMultipleMedia(hotel_images, {
        folder: "hotel-rooms", // Standard Cloudinary option
        context: {
          // Custom metadata must be inside 'context'
          price: price.toString(),
          description: description || "",
          room_type: room_type,
          position: position || "",
        },
      });
      console.log(uploadResults);
    }

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
