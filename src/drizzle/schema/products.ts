import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  categoryId: uuid("category_id").notNull(),
  userId: uuid("user_id").notNull(),
  deleted: boolean("deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});