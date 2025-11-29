import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const recordingsTable = pgTable(
  "recordings",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("recordings_duration_idx").on(table.duration),
    index("recordings_created_at_idx").on(table.createdAt),
  ],
);

export type Recording = typeof recordingsTable.$inferSelect;
