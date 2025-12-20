import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { messagesTable } from "@/db/schema/chat/messages";

export const learningAssetTypeEnum = pgEnum("learning_asset_type", [
  "flashcards",
  "mini_quiz",
]);
export type LearningAssetType =
  (typeof learningAssetTypeEnum.enumValues)[number];

export const learningAssetsTable = pgTable(
  "learning_assets",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => messagesTable.id, { onDelete: "cascade" }),
    type: learningAssetTypeEnum("type").notNull(),
    content: jsonb("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("learning_assets_message_id_idx").on(table.messageId),
    index("learning_assets_type_idx").on(table.type),
  ],
);

export type LearningAsset = typeof learningAssetsTable.$inferSelect;
