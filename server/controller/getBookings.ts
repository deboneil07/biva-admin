import { Hono, type Context } from "hono";
import { hasRole, isAuthenticated } from "../middleware/auth";
import { db } from "../db";
import {
  foodCourtEventTable,
  foodCourtTable,
  hotelRoomReservation,
} from "../drizzle/schema";
import { desc } from "drizzle-orm";

export const getBookingsRouter = new Hono();

getBookingsRouter.get(
  "/hotel",
  isAuthenticated,
  hasRole(["employee", "admin"]),
  async (c: Context) => {
    const result = await db
      .select({
        id: hotelRoomReservation.id,
        application_id: hotelRoomReservation.applicationId,
        room_number: hotelRoomReservation.roomNumber,
        name: hotelRoomReservation.name,
        email: hotelRoomReservation.email,
        aadhar_or_pan_img_url: hotelRoomReservation.aadharOrPanImgUrl,
        phone_number: hotelRoomReservation.phoneNumber,
        total_people: hotelRoomReservation.totalPeople,
        total_rooms: hotelRoomReservation.totalRooms,
        paid: hotelRoomReservation.paid,
        total_amount: hotelRoomReservation.totalAmount,
        created_at: hotelRoomReservation.createdAt,
      })
      .from(hotelRoomReservation)
      .orderBy(desc(hotelRoomReservation.createdAt));
    return c.json({ data: result }, 200);
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
      .select({
        id: foodCourtEventTable.id,
        name: foodCourtEventTable.name,
        email: foodCourtEventTable.email,
        aadhar_or_pan_img_url: foodCourtEventTable.aadharOrPanImgUrl,
        phone_number: foodCourtEventTable.phoneNumber,
        total_people: foodCourtEventTable.totalPeople,
        table_id: foodCourtEventTable.tableId,
        event_id: foodCourtEventTable.eventId,
        paid: foodCourtEventTable.paid,
        total_amount: foodCourtEventTable.totalAmount,
        created_at: foodCourtEventTable.createdAt,
        status: foodCourtEventTable.status,
      })
      .from(foodCourtEventTable)
      .orderBy(desc(foodCourtEventTable.createdAt));
    return c.json({ data: result }, 200);
  },
);
