import type { Context } from "hono";
import {
  CloudinaryService,
  type UploadFileResult,
} from "../utils/cloudinary-service.ts";

const cloudService = new CloudinaryService();

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
  room_id: string | undefined;
};

type HotelHero = {
  public_id: string;
  url: string;
  position: string;
};

export const getImage = async (c: Context) => {
  try {
    const param = (c.req.param("folder") || "").toLowerCase();

    // Helper: fetch all items with a context key "position"
    const itemsWithPosition = await cloudService.listByMetadata("position");

    // Filter helper
    const filterByPosition = (items: any[], position: string) => {
      return items.filter((itm) => itm.context?.position === position);
    };

    if (param.includes("hotel")) {
      const heroItems = filterByPosition(itemsWithPosition, "hotel-hero");
      const banquetItems = filterByPosition(itemsWithPosition, "banquet");

      const hero: HotelHero[] = heroItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));
      const banquet: HotelHero[] = banquetItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));

      return c.json({
        data: {
          hero,
          banquet,
        },
      });
    } else if (param.includes("events")) {
      const events = await cloudService.listImages("events", true);
      return c.json({
        events: events.map((img) => ({
          event_id: img.context?.id,
          price: img.context?.price,
          name: img.context?.name,
          group_name: img.context?.group_name,
          date: img.context?.date,
          time: img.context?.time,
          public_id: img.public_id,
          url: img.secure_url,
        })),
      });
    } else if (param.includes("gallery")) {
      const gallery = await cloudService.listImages("gallery", true);
      return c.json({
        gallery: gallery.map((img) => ({
          public_id: img.public_id,
          url: img.secure_url,
        })),
      });
    } else if (param.includes("food-court")) {
      const foodCourtItems = await cloudService.listImages("food-court", true);
      const heroItems = filterByPosition(foodCourtItems, "food-court-hero");

      const hero: HotelHero[] = heroItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));

      const preferences: { public_id: string; url: string; name: string }[] =
        [];

      foodCourtItems.forEach((itm) => {
        if (itm.context?.position === "preference") {
          const name = itm.context.name;
          if (name && (name === "veg" || name === "non-veg")) {
            preferences.push({
              public_id: itm.public_id,
              url: itm.secure_url,
              name,
            });
          }
        }
      });

      return c.json({
        data: {
          hero,
          preferences,
        },
      });
    } else if (param.includes("hotel-rooms")) {
      const roomItems = await cloudService.listByMetadata("position");
      const roomFiltered = filterByPosition(roomItems, "rooms");

      const rooms: GroupedRooms[] = roomFiltered.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        desc: itm.context?.description ?? "description not available",
        price: itm.context?.price ?? "no price available",
        room_id: itm.context?.id,
      }));

      return c.json({ rooms });
    } else if (param.includes("bakery")) {
      const bakeryImages = await cloudService.listImagesByTags(bakeryTypes);
      const groupedItems: GroupedBakeryItems = {
        bread: [],
        biscuit: [],
        rusk: [],
        puff_and_snacks: [],
      };

      bakeryImages.forEach((img) => {
        const primaryTag = img.tags?.[0];
        if (!primaryTag || !bakeryTypes.includes(primaryTag)) {
          return;
        }
        const desc = img.context?.alt ?? "Description not available";

        groupedItems[primaryTag as keyof GroupedBakeryItems].push({
          title: img.context?.caption ?? "",
          public_id: img.public_id,
          desc,
          url: img.secure_url,
        });
      });

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
  } catch (error: any) {
    console.error("Error listing Cloudinary images:", error);
    return c.json({ error: error.message }, 500);
  }
};

export const uploadImage = async (
  imgFile: File,
  folder: string,
  context: Record<string, string>,
): Promise<UploadFileResult> => {
  try {
    const res = await cloudService.uploadMedia(imgFile, {
      maxSizeBytes: 3 * 1024 * 1024,
      folder,
      context,
    });
    return res;
  } catch (err: any) {
    console.error("uploadImage error:", err);
    throw new Error("Image upload failed");
  }
};
