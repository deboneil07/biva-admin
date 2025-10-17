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
    // console.log("init", itemsWithPosition)

    // Filter helper
    // const filterByPosition = (items: any[], position: string) => {
    //   return items.filter((itm) => itm.context?.position === position);
    // };

    if (param.includes("hotel")) {
      const HotelHeroItems = await cloudService.listByMetadata(
        "position",
        "hero",
        param,
      );
      // const heroItems = filterByPosition(itemsWithPosition, "hero");
      console.log("hero itemns", HotelHeroItems);
      // const banquetItems = filterByPosition(itemsWithPosition, "banquet");
      const HotelBanquetItems = await cloudService.listByMetadata(
        "position",
        "banquet",
        param,
      );

      const hero: HotelHero[] = HotelHeroItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));
      const banquet: HotelHero[] = HotelBanquetItems.map((itm) => ({
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
      // const foodCourtItems = await cloudService.listImages("food-court", true);
      // const heroItems = filterByPosition(foodCourtItems, "hero");
      const FoodCourtHeroItems = await cloudService.listByMetadata(
        "position",
        "hero",
        param,
      );
      const FoodCourtPreference = await cloudService.listByMetadata(
        "position",
        "name",
        param,
      );

      const hero: HotelHero[] = FoodCourtHeroItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));

      const preferences: { public_id: string; url: string; name: string }[] =
        [];

      FoodCourtPreference.forEach((itm) => {
        preferences.push({
          public_id: itm.public_id,
          url: itm.secure_url,
          name: itm?.context.name,
        });
      });

      return c.json({
        data: {
          hero,
          preferences,
        },
      });
    } else if (param.includes("hotel-rooms")) {
      const roomItems = await cloudService.listByMetadata(
        "position",
        "rooms",
        param,
      );
      // const roomFiltered = filterByPosition(roomItems, "rooms");
      console.log("roomitems", roomItems);
      const rooms: GroupedRooms[] = roomItems.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        desc: itm.context?.description ?? "description not available",
        price: itm.context?.price ?? "no price available",
        room_id: itm.context?.id,
      }));

      return c.json({ rooms });
    } else if (param.includes("bakery")) {
      const bakeryImages = await cloudService.listImagesByTags(bakeryTypes);
      const bakeryHero = await cloudService.listByMetadata(
        "position",
        "hero",
        param,
      );

      const hero: HotelHero[] = bakeryHero.map((itm) => ({
        public_id: itm.public_id,
        url: itm.secure_url,
        position: itm.context.position,
      }));

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
        data: { hero: hero, groupedItems },
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

export const uploadImageVideoController = async (
  c: Context,
  // imgFile: File,
  // folder: string,
  // context: Record<string, string>,
) => {
  try {
    const form = await c.req.parseBody();

    const file = form["file"];
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const folder = form["folder"] as string;

    const metadata: Record<any, any> = {};
    for (const [key, value] of Object.entries(form)) {
      if (key === "folder" || key === "file") continue;
      if (typeof value === "string") {
        metadata[key] = value;
      }
    }
    const res = await cloudService.uploadMedia(file, {
      maxSizeBytes: 3 * 1024 * 1024,
      folder,
      context: metadata,
    });
    return c.json(res);
  } catch (err: any) {
    console.error("uploadImage error:", err);
    throw new Error("Image upload failed");
  }
};

export const uploadMediaMethod = async (file: File, folder: string) => {
  const res = await cloudService.uploadMedia(file, {
    folder,
  });
  return res;
};
export const deleteMediaController = async (c: Context) => {
  try {
    const body = c.req.json();
    const public_ids: string[] = body.public_ids;
    if (!Array.isArray(public_ids) || public_ids.length == 0) {
      return c.json(
        { success: false, message: "public_ids must be non-empty array" },
        400,
      );
    }
    const res = await cloudService.deleteImageVideo(public_ids);
    return c.json({ success: true, res }, 200);
  } catch (err: any) {
    console.error("deleteMediaController error:", err);
    return c.json(
      { success: false, message: err.message || "Delete failed" },
      500,
    );
  }
};
