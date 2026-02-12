import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { generateId } from "@/lib/id";

export const pendingChatIdAtom = atom<string>(generateId());

export const chatInstanceAtomFamily = atomFamily((chatId?: string) =>
  atom(
    new Chat<UIMessage>({
      id: chatId,
      transport: new DefaultChatTransport({
        api: "/api/ai",
      }),
      onData: () => {
        // TODO: a good way to set the chat title...
      },
    }),
  ),
);
