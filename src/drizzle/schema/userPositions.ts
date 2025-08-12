import { pgTable, uuid, integer, date, primaryKey } from "drizzle-orm/pg-core";

export const userPositions = pgTable(
  "user_positions",
  {
    userId: uuid("user_id").notNull(),
    lastPosition: integer("last_position").notNull(),
    lastUpdatedDate: date("last_updated_date").notNull(),
    upBy: integer("up_by").default(0).notNull(),
    downBy: integer("down_by").default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId] }),
  })
);
