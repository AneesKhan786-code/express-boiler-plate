import { pgTable, uuid, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  deleted: boolean("deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});