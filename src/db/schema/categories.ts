import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  deleted: boolean("deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
