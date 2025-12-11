import type { Context } from "hono";
import { db } from "../db";
import { ticket } from "../drizzle/schema";

export default async function getTickets(c: Context) {
  try {
    const result = await db.select().from(ticket);
    return c.json({ data: result }, 200);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json(
      {
        error: "Failed to fetch tickets",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
}
