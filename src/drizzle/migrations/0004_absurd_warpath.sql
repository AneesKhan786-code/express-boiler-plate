ALTER TABLE "user_positions" ADD COLUMN "up_by" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_positions" ADD COLUMN "down_by" integer DEFAULT 0 NOT NULL;