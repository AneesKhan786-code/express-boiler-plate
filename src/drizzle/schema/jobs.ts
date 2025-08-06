import { pgTable, uuid, text, timestamp, numeric, boolean as pgBoolean } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  salary: numeric("salary", { mode: "number" }), // ✅ Corrected
  isDeleted: pgBoolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").notNull(),
});
