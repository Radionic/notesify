import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomFamily } from "jotai-family";
import { MOBILE_BREAKPOINT } from "@/hooks/use-mobile";

export const chatsOpenAtom = atomWithStorage<boolean>(
  "chatsOpen",
  window.innerWidth >= MOBILE_BREAKPOINT,
);
export const threadFinderOpenAtom = atom<boolean>(false);
export const activeChatIdAtom = atom<string>("");

export const chatInstanceAtomFamily = atomFamily((chatId: string) =>
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
