import { Hono, type Context } from "hono";
import { db } from "../db";
import type { UploadFileResult } from "../utils/cloudinary-service";
import { uploadMediaMethod, uploadMultipleMedia } from "./imageController";
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
    console.log("DELETE GOT THIS BODY", body);

    // 1. Get the room_type from the body
    const room_type: string[] = body["room_type"];

    if (!room_type || typeof room_type !== "string") {
      return c.json(
        { error: "Invalid or missing 'room_type' in request body." },
        400,
      );
    }

    // Initialize an instance of your Cloudinary service
    const cloudinaryService = new CloudinaryService();

    // 2. Find all images in Cloudinary with the matching context
    console.log(
      `Searching for images in Cloudinary with room_type: ${room_type}`,
    );
    const imagesToDelete = await cloudinaryService.listByMetadata(
      "room_type", // The metadata key
      room_type, // The metadata value
      "hotel-rooms", // The folder to search within
    );

    if (imagesToDelete.length === 0) {
      console.log(`No images found in Cloudinary for room_type: ${room_type}`);
    } else {
      console.log(
        `Found ${imagesToDelete.length} images to delete from Cloudinary.`,
      );
    }

    // 3. Delete the images from Cloudinary
    const publicIdsToDelete = imagesToDelete.map((img) => img.public_id);
    let cloudinaryDeleteResult;
    if (publicIdsToDelete.length > 0) {
      cloudinaryDeleteResult =
        await cloudinaryService.deleteImageVideo(publicIdsToDelete);
      console.log("Cloudinary deletion result:", cloudinaryDeleteResult);
    }

    // 4. Delete the room records from the database
    console.log(
      `Deleting room records from database with typeOfRoom: ${room_type}`,
    );
    const deletedRooms = await db
      .delete(adminHotelRoomReservation)
      .where(eq(adminHotelRoomReservation.typeOfRoom, room_type))
      .returning({
        // Return the room numbers of the deleted records
        room_number: adminHotelRoomReservation.roomNumber,
      });

    if (deletedRooms.length === 0) {
      return c.json(
        {
          error: `No hotel rooms found in the database with room_type: ${room_type}`,
        },
        404,
      );
    }

    // 5. Return a success response with details
    return c.json(
      {
        success: true,
        message: `Successfully deleted all rooms and associated images for room_type: ${room_type}`,
        details: {
          deleted_db_records_count: deletedRooms.length,
          deleted_room_numbers: deletedRooms.map((r) => r.room_number),
          deleted_cloudinary_images_count: publicIdsToDelete.length,
          cloudinary_deletion_status: cloudinaryDeleteResult
            ? "Success"
            : "No images to delete",
        },
      },
      200,
    );
  } catch (err: any) {
    console.error("Error during room deletion:", err);
    return c.json(
      { error: "Internal server error", details: err.message },
      500,
    );
  }
});
