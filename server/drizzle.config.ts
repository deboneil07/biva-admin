import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./db/auth-schema.ts", "./drizzle/schema.ts"],
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.NEON_PG_URL!,
  },
});

