CREATE TYPE "public"."role" AS ENUM('admin', 'employee', 'media-handler');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'employee' NOT NULL;