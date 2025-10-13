ALTER TABLE "user" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "aadhar_img_url" text DEFAULT '' NOT NULL;