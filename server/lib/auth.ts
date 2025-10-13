import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { account, session, user, verification } from "../db/auth-schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: ["admin", "employee", "media-handler"],
        defaultValue: "employee",
      },
    },
  },
  trustedOrigins: ["http://localhost:5173"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minute
    },
    expiresIn: 60 * 60 * 24, // 1 day"
  },
  plugins: [
    admin({
      adminUserIds: ["IyOLTbLrISwOdmyHJeG0aDgDqjyHnFJp"],
    }),
  ],
});
