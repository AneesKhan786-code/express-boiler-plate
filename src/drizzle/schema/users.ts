// src/drizzle/schema/users.ts
import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),           // nullable for Google users
  googleId: varchar("google_id", { length: 255 }),          // set for Google users
  role: varchar("role", { length: 20 }).default("user").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
