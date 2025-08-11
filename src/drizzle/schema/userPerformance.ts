import { pgTable, uuid, integer, real, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userPerformance = pgTable("user_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  totalExpenses: real("total_expenses").notNull(),
  totalProducts: real("total_products").notNull(),
  activityPercentage: real("activity_percentage").notNull(), // 0–100
  upBy: integer("up_by").default(0),
  downBy: integer("down_by").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
