import { Hono, type Context } from "hono";
import { hasRole, isAuthenticated } from "../middleware/auth";
import { db } from "../db";
import {
  foodCourtEventTable,
  foodCourtTable,
  hotelRoomReservation,
} from "../drizzle/schema";
import { desc, inArray } from "drizzle-orm";

export const getBookingsRouter = new Hono();

getBookingsRouter.get(
  "/hotel",
  isAuthenticated,
  hasRole(["employee", "admin"]),
  async (c: Context) => {
    const result = await db
      .select()
      .from(hotelRoomReservation)
      .orderBy(desc(hotelRoomReservation.createdAt));
    return c.json({ data: result }, 200);
  },
);

getBookingsRouter.delete(
  "/hotel",
  isAuthenticated,
  hasRole(["employee", "admin"]),
  async (c: Context) => {
    try {
      const body = await c.req.json();
      const ids: number[] = body?.ids;

      if (!Array.isArray(ids) || ids.length === 0) {
        return c.json({ error: "ids must be a non-empty array" }, 400);
      }

      const deletedRows = await db
        .delete(hotelRoomReservation)
        .where(inArray(hotelRoomReservation.id, ids))
        .returning({ id: hotelRoomReservation.id });

      if (!deletedRows.length) {
        return c.json(
          { error: "No hotel bookings found for the provided ids" },
          404,
        );
      }

      return c.json({ success: true, deleted: deletedRows }, 200);
    } catch (error) {
      console.error("Error deleting hotel bookings:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

getBookingsRouter.get(
  "/food-court",
  isAuthenticated,
  hasRole(["employee", "admin"]),
  async (c: Context) => {
    const result = await db
      .select({
        id: foodCourtTable.id,
        name: foodCourtTable.name,
        email: foodCourtTable.email,
        food_preferences: foodCourtTable.foodPreference,
        time_slot: foodCourtTable.timeSlot,
        aadhar_or_pan_img_url: foodCourtTable.aadharOrPanImgUrl,
        phone_number: foodCourtTable.phoneNumber,
        total_people: foodCourtTable.totalPeople,
        paid: foodCourtTable.paid,
        total_amount: foodCourtTable.totalAmount,
        created_at: foodCourtTable.createdAt,
        status: foodCourtTable.status,
      })
      .from(foodCourtTable)
      .orderBy(desc(foodCourtTable.createdAt));
    return c.json({ data: result }, 200);
  },
);

getBookingsRouter.get(
  "/events",
  isAuthenticated,
  hasRole(["employee", "admin"]),
  async (c: Context) => {
    const result = await db
      .select()
      .from(foodCourtEventTable)
      .orderBy(desc(foodCourtEventTable.createdAt));
    return c.json({ data: result }, 200);
  },
);
