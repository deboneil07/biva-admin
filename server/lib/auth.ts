import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { account, session, user, verification } from "../db/auth-schema.ts";
import { admin, emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

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
      phone: {
        type: "string",
        defaultValue: "",
      },
      aadhar_img_url: {
        type: "string",
        defaultValue: "",
      },
    },
  },
  trustedOrigins: ["https://biva-admin.onrender.com"],
  //https://biva-admin.onrender.com
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 24,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: true,
  },
  plugins: [
    admin({
      adminUserIds: ["bwxxiqOpOknRYaom20Iyt4OdjVBnjGrU"],
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[EmailOTP] Type: ${type}, Email: ${email}, OTP: ${otp}`);
        
        if (type === "forget-password") {
          // console.log(`\n===========================================`);
          // console.log(`PASSWORD RESET OTP FOR: ${email}`);
          // console.log(`OTP CODE: ${otp}`);
          // console.log(`===========================================\n`);
          
          try {
            // Send email to bivawebsite@gmail.com (your verified Resend email)
            // Note: To send to hello@thebiva.com, you need to verify your domain at resend.com/domains
            const { data, error } = await resend.emails.send({
              from: "The Biva Admin <onboarding@resend.dev>",
              to: ["bivawebsite@gmail.com"], // Your verified email
              subject: `Password Reset OTP for ${email}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Password Reset Request</h2>
                  <p>A password reset was requested for: <strong>${email}</strong></p>
                  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; text-align: center; margin: 0;">
                      ${otp}
                    </h1>
                  </div>
                  <p style="color: #666;">This OTP will expire in 5 minutes.</p>
                  <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
              `,
            });

            if (error) {
              console.error("[Resend Error]:", error);
            } else {
              console.log("[Resend Success] Email sent with ID:", data?.id);
            }
          } catch (error) {
            console.error("[Resend Exception]:", error);
          }
        }
      },
      otpLength: 6,
      sendVerificationOnSignUp: false,
    }),
  ],
});
