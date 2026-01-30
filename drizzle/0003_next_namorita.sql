CREATE TYPE "public"."admin_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER');--> statement-breakpoint
CREATE TYPE "public"."admin_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BANNED');--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"profile_image_url" text,
	"role" "admin_role_enum" DEFAULT 'MANAGER' NOT NULL,
	"status" "admin_status_enum" DEFAULT 'ACTIVE' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "fk_admin_logs_admin" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_logs_admin_id" ON "admin_logs" USING btree ("admin_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_admins_email" ON "admins" USING btree ("email" text_ops);