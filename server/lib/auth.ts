import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { account, session, user, verification } from "../db/auth-schema";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
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
    // roles: {
    //     admin: 'admin',
    //     employee: 'employee',
    //     'media-handler': 'media-handler',
    // }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 24,
  },
  plugins: [
    admin({
      adminUserIds: ["IyOLTbLrISwOdmyHJeG0aDgDqjyHnFJp"],
    }),
  ],
});
