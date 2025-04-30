import { MessageDB, messagesTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { asc, eq } from "drizzle-orm";

export const getMessage = async (id: string) => {
  const db = await getDB();
  const message = await db.query.messagesTable.findFirst({
    where: eq(messagesTable.id, id),
  });
  return message;
};

export const getMessages = async (chatId: string) => {
  const db = await getDB();
  const messages = await db.query.messagesTable.findMany({
    where: eq(messagesTable.chatId, chatId),
    orderBy: [asc(messagesTable.createdAt)],
  });
  return messages;
};

export const saveMessage = async (message: MessageDB) => {
  const db = await getDB();
  await db.insert(messagesTable).values(message);
};
