import { Hono } from "hono";
import { hasRole, isAuthenticated, type UserRole } from "../middleware/auth";
import { auth } from "../lib/auth";
import { db } from "../db";
import { user } from "../db/auth-schema";
import { desc, eq, ne } from "drizzle-orm";
import { type UploadFileResult } from "../utils/cloudinary-service";
import { uploadImage } from "./imageController";

export const adminRouter = new Hono();

adminRouter.post(
  "/create-user",
  isAuthenticated,
  hasRole(["admin"]),
  async (c) => {
    const body = await c.req.parseBody();

    const parsedBody = body as {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      image: File | string;
      phone: string;
      aadhar_img_url: File | string;
    };

    let mainImageUrl: string | undefined;
    let aadharImageUrl: string | undefined;

    try {
      const aadharFile = parsedBody.aadhar_img_url;

      if (!(aadharFile instanceof File)) {
        return c.json({ Error: "Aadhar or PAN image file is required!" }, 400);
      }

      const uploadedAadhar: UploadFileResult | undefined = await uploadImage(
        aadharFile,
        "adminEmployeeImages",
      );

      if (!uploadedAadhar?.secure_url) {
        return c.json(
          { Error: "Failed to upload Aadhar image or secure URL is missing!" },
          500,
        );
      }
      aadharImageUrl = uploadedAadhar.optimized_url;

      const mainImageFile = parsedBody.image;

      if (mainImageFile instanceof File) {
        const uploadedMainImage: UploadFileResult | undefined =
          await uploadImage(mainImageFile, "adminEmployeeImages");

        if (uploadedMainImage?.secure_url) {
          mainImageUrl = uploadedMainImage.optimized_url;
        } else {
          console.warn(
            "Main profile image upload failed. Proceeding with null URL.",
          );
        }
      } else if (typeof mainImageFile === "string") {
        mainImageUrl = mainImageFile;
      }

      const newUser = await auth.api.createUser({
        body: {
          name: parsedBody.name,
          email: parsedBody.email,
          password: parsedBody.password,
          data: {
            image: mainImageUrl,
            role: parsedBody.role,
            phone: parsedBody.phone,
            aadhar_img_url: aadharImageUrl,
          },
        },
        headers: c.req.raw.headers,
      });

      return c.json(
        {
          message: `User ${parsedBody.email} created successfully with role ${parsedBody.role}.`,
          user: {
            id: newUser.user.id,
            email: newUser.user.email,
            role: parsedBody.role,
          },
        },
        201,
      );
    } catch (error: any) {
      console.error("Better Auth User Creation Failure:", error);
      console.error("Error Message:", error.message);
      console.error("Error Status Code:", error.statusCode);

      return c.json(
        {
          error: "User creation failed",
          message: error.message || "An unknown error occurred.",
        },
        error.statusCode || 400,
      );
    }
  },
);

adminRouter.delete(
  "/delete-user",
  isAuthenticated,
  hasRole(["admin"]),
  async (c) => {
    let userIds: string[];
    let deleteCount = 0;

    try {
      const body = await c.req.json();
      userIds = (body.userIds as string[]) || [];

      if (!userIds || userIds.length === 0) {
        return c.json({ error: "No user IDs provided" }, 400);
      }
      const deleteUsers = userIds.map(async (id) => {
        try {
          await auth.api.removeUser({
            body: {
              userId: id,
            },
            headers: c.req.raw.headers,
          });

          deleteCount++;
          return { id, success: true };
        } catch (error) {
          console.warn(`Failed to delete user ID ${id}:`, error);
          return { id, success: false, error: (error as Error).message };
        }
      });

      const results = await Promise.all(deleteUsers);
      const failedDeletions = results.filter((r) => !r.success);
      return c.json(
        {
          message: `Successfully deleted ${deleteCount} user(s).`,
          deletedCount: deleteCount,
          failedCount: failedDeletions.length,
          failedDeletions: failedDeletions,
        },
        deleteCount > 0 ? 200 : 207,
      );
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return c.json({ error: error.message }, 500);
    }
  },
);

adminRouter.get(
  "/get-users",
  isAuthenticated,
  hasRole(["admin"]),
  async (c) => {
    try {
      const allUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          phone: user.phone,
          createdAt: user.createdAt,
          aadhar_img_url: user.aadhar_img_url,
        })
        .from(user)
        .where(ne(user.role, "admin"))
        .orderBy(desc(user.createdAt));

      return c.json({
        count: allUsers.length,
        users: allUsers,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to retrieve user list." }, 500);
    }
  },
);

adminRouter.put(
  "/edit-roles",
  isAuthenticated,
  hasRole(["admin"]),
  async (c) => {
    const { userId, newRole } = (await c.req.json()) as {
      userId: string;
      newRole: UserRole;
    };

    try {
      await db.update(user).set({ role: newRole }).where(eq(user.id, userId));

      return c.json(
        {
          message: `Role for user ID ${userId} successfully updated to ${newRole}.`,
        },
        200,
      );
    } catch (error: any) {
      console.error("Role update error:", error);

      return c.json(
        {
          error: "Role update failed",
          message:
            error.message || "An unknown error occurred during role update.",
        },
        400,
      );
    }
  },
);
