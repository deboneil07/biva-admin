import type { Context } from "hono";
import {
  CloudinaryService,
  type UploadFileResult,
} from "../utils/cloudinary-service.ts";

const MAX_BYTES = 5 * 1024 * 1024;

const cloudService = new CloudinaryService();

const roomTypes = [
  "suite_room",
  "executive_room",
  "studio_room",
  "deluxe_room",
  "super_deluxe_room",
  "twin_room",
];

type BakeryItem = {
  title: string;
  public_id: string;
  url: string;
  desc: string;
};

type GroupedBakeryItems = {
  bread: BakeryItem[];
  biscuit: BakeryItem[];
  rusk: BakeryItem[];
  puff_and_snacks: BakeryItem[];
};

const bakeryTypes = ["bread", "biscuit", "rusk", "puff_and_snacks"];

type GroupedRooms = {
  public_id: string;
  url: string;
  desc: string;
  price: string;
  tag: string;
};

export const getImage = async (c: Context) => {
  try {
    const param = c.req.param("folder") || "";

    if (param.toLowerCase().includes("hotel")) {
      const hotelHero = await cloudService.listImages("hotel-hero", true);
      const hotelEvents = await cloudService.listImages("events", true);
      const hotelGallery = await cloudService.listImages("gallery", true);

      const groupedRoom: GroupedRooms[] = [];

      const taggedImages = await cloudService.listImagesByTags(roomTypes);
      console.log("Tagged images", taggedImages);

      taggedImages.forEach((room) => {
        const isTag = room.tags[0];

        if (!isTag) {
          return; // Skip if no tag
        }

        const desc =
          room.context && room.context.alt
            ? room.context.alt
            : "description not available";
        const price =
          room.context && room.context.Price
            ? room.context.Price
            : "no price available";

        groupedRoom.push({
          public_id: room.public_id,
          url: room.secure_url,
          desc: desc,
          price: price,
          tag: isTag,
        });
      });

      console.log("gp", groupedRoom);

      return c.json({
        data: {
          hero: hotelHero.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
          events: hotelEvents.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
          gallery: hotelGallery.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
          rooms: groupedRoom,
        },
      });
    } else if (param.toLowerCase().includes("food-court")) {
      const foodCourtHero = await cloudService.listImages(
        "food-court-hero",
        true,
      );
      // const foodCourtTables = await cloudService.listImages(
      //   "food-court-tables",
      //   true,
      // ); // unused for now

      const foodCourtEvents = await cloudService.listImages("events", true);
      const foodCourtGallery = await cloudService.listImages("gallery", true);

      return c.json({
        data: {
          hero: foodCourtHero.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
          events: foodCourtEvents.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
          gallery: foodCourtGallery.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
        },
      });
    } else if (param.toLowerCase().includes("bakery")) {
      const bakeryImages = await cloudService.listImagesByTags(bakeryTypes);
      const groupedItems: GroupedBakeryItems = {
        bread: [],
        biscuit: [],
        puff_and_snacks: [],
        rusk: [],
      };

      bakeryImages.forEach((image) => {
        const primaryTag =
          image.tags && image.tags.length > 0 ? image.tags[0] : null;

        if (!primaryTag || !bakeryTypes.includes(primaryTag)) {
          console.log(`Skipping ${image.public_id}: Invalid or no tag found`);
          return;
        }

        const desc =
          image.context && image.context.alt
            ? image.context.alt
            : "Description not available";

        const item: BakeryItem = {
          title: image.context.caption,
          public_id: image.public_id,
          desc: desc,
          url: image.secure_url,
        };

        groupedItems[primaryTag as keyof GroupedBakeryItems].push(item);
      });

      console.log("Grouped Items:", groupedItems);
      return c.json({
        data: groupedItems,
      });
    } else {
      const images = await cloudService.listImages(param);
      return c.json({
        data: {
          [param || "images"]: images.map((img) => ({
            public_id: img.public_id,
            url: img.secure_url,
          })),
        },
      });
    }
  } catch (error) {
    console.error("Error listing Cloudinary images:", error);
    return c.json({ error: "Failed to fetch images" }, 500);
  }
};

export const uploadImage = async (
  imgFile: File,
  folder: string,
): Promise<UploadFileResult> => {
  try {
    const res = await cloudService.uploadMedia(imgFile, {
      maxSizeBytes: 3 * 1024 * 1024,
      folder: folder,
    });

    return res;
  } catch (err: any) {
    throw new Error("Image upload Failed");
  }
};
