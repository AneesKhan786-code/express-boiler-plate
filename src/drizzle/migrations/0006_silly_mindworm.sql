CREATE TYPE "public"."sos" AS ENUM('email', 'google');--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sos" "sos" DEFAULT 'email' NOT NULL;