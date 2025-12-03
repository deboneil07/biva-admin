import {
  pgTable,
  unique,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  foreignKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const role = pgEnum("role", [
  "user",
  "admin",
  "employee",
  "media-handler",
]);

export const hotelRoomReservation = pgTable(
  "hotelRoomReservation",
  {
    id: serial().primaryKey().notNull(),
    applicationId: text("application_id")
      .default(`gen_random_uuid()`)
      .notNull(),
    name: text().notNull(),
    email: text().notNull(),
    aadharOrPanImgUrl: text("aadhar_or_pan_img_url").notNull(),
    phoneNumber: text("phone_number").notNull(),
    totalPeople: integer("total_people").default(1).notNull(),
    totalRooms: integer("total_rooms").default(1).notNull(),
    paid: boolean().default(false).notNull(),
    totalAmount: integer("total_amount").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    joinDate: text("join_date").notNull(),
    leaveDate: text("leave_date").notNull(),
    roomType: text("room_type").notNull(),
  },
  (table) => [
    unique("hotelRoomReservation_application_id_unique").on(
      table.applicationId,
    ),
    unique("hotelRoomReservation_email_unique").on(table.email),
    unique("hotelRoomReservation_phone_number_unique").on(table.phoneNumber),
  ],
);

export const adminHotelRoomReservation = pgTable(
  "adminHotelRoomReservation",
  {
    roomId: serial("room_id").primaryKey().notNull(),
    typeOfRoom: text("type_of_room").notNull(),
    occupancy: integer().notNull(),
    price: integer().notNull(),
    roomImage: text("room-image").notNull(),
    totalRooms: text("total_rooms").default(1).notNull(),
  },
  (table) => [
    unique("adminHotelRoomReservation_type_of_room_key").on(table.typeOfRoom),
  ],
);

export const adminEventTable = pgTable(
  "adminEventTable",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "adminFoodCourtTable_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
      }),
    eventId: text("event_id").notNull(),
    eventName: text("event_name").notNull(),
    groupName: text("group_name").notNull(),
    ticketPrice: integer("ticket_price").default(0).notNull(),
    date: text().notNull(),
    time: text().notNull(),
    banner: text().notNull(),
  },
  (table) => [unique("adminFoodCourtTable_table_name_key").on(table.eventId)],
);

export const foodCourtTable = pgTable(
  "foodCourtTable",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    totalPeople: integer("total_people").default(1).notNull(),
    status: text().default("available").notNull(),
    aadharOrPanImgUrl: text("aadhar_or_pan_img_url").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text().notNull(),
    foodPreference: text("food_preference").default("veg").notNull(),
    timeSlot: text("time_slot").notNull(),
    paid: boolean().default(false).notNull(),
    totalAmount: integer("total_amount").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("foodCourtTable_phone_number_unique").on(table.phoneNumber),
  ],
);

export const foodCourtEventTable = pgTable(
  "foodCourtEventTable",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    aadharOrPanImgUrl: text("aadhar_or_pan_img_url").notNull(),
    phoneNumber: text("phone_number").notNull(),
    totalPeople: integer("total_people").default(1).notNull(),
    eventId: text("event_id").notNull(),
    status: text().default("available").notNull(),
    paid: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    totalAmount: integer("total_amount").notNull(),
  },
  (table) => [
    unique("foodCourtEventTable_email_unique").on(table.email),
    unique("foodCourtEventTable_phone_number_unique").on(table.phoneNumber),
  ],
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    role: role().default("employee").notNull(),
    phone: text().default("").notNull(),
    aadharImgUrl: text("aadhar_img_url").default("").notNull(),
    image: text(),
    banned: boolean().default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const ticket = pgTable("ticket", {
  id: integer()
    .primaryKey()
    .generatedAlwaysAsIdentity({
      name: "ticket_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  category: text().notNull(),
  subject: text().notNull(),
  description: text().notNull(),
});
