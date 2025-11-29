import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";

export const chatsOpenAtom = atom<boolean>(false);
export const threadFinderOpenAtom = atom<boolean>(false);
export const activeChatIdAtom = atom<string>("TMP");

export const withThinkingAtom = atomWithStorage<boolean>(
  "with-thinking",
  false,
);

export const chatInstanceAtomFamily = atomFamily((chatId: string) =>
  atom(
    new Chat<UIMessage>({
      id: chatId,
      transport: new DefaultChatTransport({
        api: "/api/ai",
      }),
    }),
  ),
);
