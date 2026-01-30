ALTER TABLE "admins" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "two_factor_secret" text;