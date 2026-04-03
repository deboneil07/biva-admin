import { Hono, type Context } from "hono";
import { db } from "../db";
import type { UploadFileResult } from "../utils/cloudinary-service";
import { uploadMediaMethod, uploadMultipleMedia } from "./imageController";
import { adminHotelRoomReservation } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { convertUrlsToPublicId } from "../utils/getPublicIdFromUrl";

import { CloudinaryService } from "../utils/cloudinary-service";

export const hotelRouter = new Hono();

hotelRouter.get("/type-of-rooms", async (c: Context) => {
  try {
    const rooms = await db
      .select({
        typeOfRoom: adminHotelRoomReservation.typeOfRoom,
        occupancy: adminHotelRoomReservation.occupancy,
        price: adminHotelRoomReservation.price,
        roomImage: adminHotelRoomReservation.roomImage,
        totalRooms: adminHotelRoomReservation.totalRooms,
        onSale: adminHotelRoomReservation.onSale,
        saleValue: adminHotelRoomReservation.saleValue,
      })
      .from(adminHotelRoomReservation);

    return c.json({ success: true, rooms }, 200);
  } catch (error: any) {
    console.error("Error fetching room types:", error);
    return c.json(
      { error: "Internal server error", details: error.message },
      500,
    );
  }
});

hotelRouter.put("/update/:roomType", async (c: Context) => {
  try {
    const roomType = c.req.param("roomType");

    if (!roomType) {
      return c.json({ error: "Missing room type parameter." }, 400);
    }

    const body = await c.req.json();
    console.log("=== PUT /update/:roomType ===");
    console.log("Room type:", roomType);
    console.log("Body:", JSON.stringify(body, null, 2));

    const { price, occupancy, total_rooms, description, position, on_sale, sale_value } = body;

    // Validate at least one field is being updated
    if (
      price === undefined &&
      occupancy === undefined &&
      total_rooms === undefined &&
      description === undefined &&
      position === undefined &&
      on_sale === undefined &&
      sale_value === undefined
    ) {
      return c.json({ error: "No fields provided to update." }, 400);
    }

    // 1. Build the DB update object with only provided fields
    const dbUpdate: Record<string, any> = {};
    if (price !== undefined) dbUpdate.price = parseInt(price, 10);
    if (occupancy !== undefined) dbUpdate.occupancy = parseInt(occupancy, 10);
    if (total_rooms !== undefined) dbUpdate.totalRooms = total_rooms.toString();
    if (on_sale !== undefined) dbUpdate.onSale = on_sale === true || on_sale === "true";
    if (sale_value !== undefined) dbUpdate.saleValue = sale_value !== null ? parseInt(sale_value, 10) : null;

    // 2. Update the DB record
    let updatedRoom = null;
    if (Object.keys(dbUpdate).length > 0) {
      const result = await db
        .update(adminHotelRoomReservation)
        .set(dbUpdate)
        .where(eq(adminHotelRoomReservation.typeOfRoom, roomType))
        .returning();

      if (result.length === 0) {
        return c.json(
          { error: `No room found in database with room_type: ${roomType}` },
          404,
        );
      }

      updatedRoom = result[0];
      console.log("DB updated:", updatedRoom);
    }

    // 3. Update Cloudinary context metadata for all images of this room type
    const cloudinaryService = new CloudinaryService();

    // Search for all Cloudinary assets with this room_type context
    const searchExpression = `context.room_type="${roomType}"`;
    console.log(
      `[CloudinaryService] Searching for assets: ${searchExpression}`,
    );

    const searchResult = await (await import("cloudinary")).v2.search
      .expression(searchExpression)
      .with_field("context")
      .max_results(500)
      .execute();

    const assetsToUpdate = searchResult.resources as Array<{
      public_id: string;
      resource_type: string;
    }>;

    console.log(
      `Found ${assetsToUpdate.length} Cloudinary asset(s) to update.`,
    );

    // Build the new context — always preserve position:"rooms" so the
    // listByMetadata("position","rooms","hotel-rooms") fetch keeps finding
    // these assets after an update. Only overwrite other fields if provided.
    const newContext: Record<string, string> = {
      room_type: roomType,
      position: "rooms", // hardcoded sentinel — never remove this
    };
    if (price !== undefined) newContext.price = price.toString();
    if (description !== undefined) newContext.description = description;

    // Update context on each asset
    const cloudinaryUpdateResults = await Promise.allSettled(
      assetsToUpdate.map((asset) =>
        cloudinaryService.updateMedia(asset.public_id, {
          context: newContext,
          forceResourceType:
            asset.resource_type === "video" ? "video" : "image",
        }),
      ),
    );

    const successCount = cloudinaryUpdateResults.filter(
      (r) => r.status === "fulfilled",
    ).length;
    const failCount = cloudinaryUpdateResults.filter(
      (r) => r.status === "rejected",
    ).length;

    console.log(
      `Cloudinary update: ${successCount} succeeded, ${failCount} failed`,
    );

    return c.json(
      {
        success: true,
        message: `Successfully updated room type: ${roomType}`,
        details: {
          updated_db_record: updatedRoom,
          cloudinary_assets_updated: successCount,
          cloudinary_assets_failed: failCount,
        },
      },
      200,
    );
  } catch (error: any) {
    console.error("Error updating hotel room:", error);
    return c.json(
      { error: "Internal server error", details: error.message },
      500,
    );
  }
});

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
    const on_sale =
      typeof body["on_sale"] === "string"
        ? body["on_sale"] === "true"
        : body["on_sale"] === true
          ? true
          : false;
    const sale_value =
      typeof body["sale_value"] === "string"
        ? parseInt(body["sale_value"], 10)
        : typeof body["sale_value"] === "number"
          ? body["sale_value"]
          : null;

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

    if (!(primaryImage instanceof File)) {
      return c.json({ error: "Primary image is not a valid file." }, 400);
    }

    // 6. Upload the primary image for the main database record
    const uploadPrimaryImage: UploadFileResult | undefined =
      await uploadMediaMethod(primaryImage, "hotel-rooms", {
        price: price.toString(),
        description: description || "",
        room_type: room_type,
        position: "rooms", // hardcoded: this is what listByMetadata queries for
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
        totalRooms: total_rooms?.toString() ?? "",
        onSale: on_sale,
        saleValue: sale_value,
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
          position: "rooms", // hardcoded: this is what listByMetadata queries for
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
    const room_types: string[] = body["room_types"];

    if (!room_types || !Array.isArray(room_types) || room_types.length === 0) {
      return c.json(
        {
          error: "Invalid or empty 'room_type' array provided in request body.",
        },
        400,
      );
    }

    // 1. Instantiate the service ONCE
    const cloudinaryService = new CloudinaryService();

    // 2. Call the new method to handle all Cloudinary logic
    const imageDeletionResult = await cloudinaryService.deleteRoomsByTypes(
      room_types,
      "hotel-rooms",
    );

    // 3. Delete the room records from the database
    console.log(
      `Deleting room records from database with typeOfRoom in: ${room_types}`,
    );
    const deletedRooms = await db
      .delete(adminHotelRoomReservation)
      .where(inArray(adminHotelRoomReservation.typeOfRoom, room_types))
      .returning({
        typeOfRoom: adminHotelRoomReservation.typeOfRoom,
      });

    if (deletedRooms.length === 0) {
      return c.json(
        {
          error: `No hotel rooms found in the database with room_types: ${room_types.join(", ")}`,
        },
        404,
      );
    }

    // 4. Return a success response with details from both operations
    return c.json(
      {
        success: true,
        message: `Successfully deleted rooms and associated images for room_types: ${room_types.join(", ")}`,
        details: {
          deleted_db_records_count: deletedRooms.length,
          deleted_room_info: deletedRooms.map((r) => ({
            type: r.typeOfRoom,
          })),
          deleted_cloudinary_images_count: imageDeletionResult.foundImagesCount,
          cloudinary_deletion_status: imageDeletionResult.deletionResult
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
