import {defineConfig} from "drizzle-kit";

export default defineConfig({
    schema: "./db/auth-schema.ts",
    dialect: "postgresql",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
})