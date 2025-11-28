import { desc, eq, like } from "drizzle-orm";
import { chatsTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { generateId } from "@/lib/id";

export const getChats = async ({ searchTerm }: { searchTerm?: string }) => {
  const db = await getDB();
  const values = await db.query.chatsTable.findMany({
    where: searchTerm ? like(chatsTable.id, `%${searchTerm}%`) : undefined, // actually case-insensitive search
    orderBy: [desc(chatsTable.updatedAt)],
  });
  return values;
};

export const getChat = async ({ id }: { id: string }) => {
  const db = await getDB();
  const value = await db.query.chatsTable.findFirst({
    where: eq(chatsTable.id, id),
  });
  return value;
};

export const createChat = async () => {
  const db = await getDB();
  const newChat = {
    id: generateId(),
    title: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(chatsTable).values(newChat);
  return newChat;
};

export const updateChatTitle = async (chatId: string, title: string) => {
  const db = await getDB();
  await db.update(chatsTable).set({ title }).where(eq(chatsTable.id, chatId));
};
