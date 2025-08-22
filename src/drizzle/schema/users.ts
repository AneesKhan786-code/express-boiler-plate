import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const sosEnum = pgEnum("sos", ["email", "google"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  googleId: varchar("google_id", { length: 255 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  verified: boolean("verified").default(false).notNull(),
  sos: sosEnum("sos").notNull().default("email"),
  createdAt: timestamp("created_at").defaultNow(),
});
