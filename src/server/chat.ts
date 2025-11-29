import { createServerFn } from "@tanstack/react-start";
import { desc, eq, like } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { generateId } from "@/lib/id";

const getChatsSchema = z.object({
  searchTerm: z.string().optional(),
});

export const getChatsFn = createServerFn()
  .inputValidator(getChatsSchema)
  .handler(async ({ data }) => {
    const values = await db.query.chatsTable.findMany({
      where: data.searchTerm
        ? like(chatsTable.id, `%${data.searchTerm}%`)
        : undefined,
      orderBy: [desc(chatsTable.updatedAt)],
    });
    return values;
  });

const getChatSchema = z.object({
  id: z.string(),
});

export const getChatFn = createServerFn()
  .inputValidator(getChatSchema)
  .handler(async ({ data }) => {
    const value = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, data.id),
    });
    return value;
  });

const createChatSchema = z.object({});

export const createChatFn = createServerFn()
  .inputValidator(createChatSchema)
  .handler(async () => {
    const newChat = {
      id: generateId(),
      title: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(chatsTable).values(newChat);
    return newChat;
  });

const updateChatTitleSchema = z.object({
  chatId: z.string(),
  title: z.string(),
});

export const updateChatTitleFn = createServerFn()
  .inputValidator(updateChatTitleSchema)
  .handler(async ({ data }) => {
    await db
      .update(chatsTable)
      .set({ title: data.title })
      .where(eq(chatsTable.id, data.chatId));
  });
