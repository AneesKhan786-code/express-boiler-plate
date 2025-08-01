import { pgTable, serial, text, varchar, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 👈 required
  verified: boolean("verified").default(false).notNull(),          // 👈 required
  createdAt: timestamp("created_at").defaultNow(),
});
