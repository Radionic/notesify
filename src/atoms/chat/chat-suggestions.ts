import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface ChatSuggestion {
  id: string;
  title: string;
  prompt: string;
}

export const chatSuggestionsAtom = atomWithStorage<ChatSuggestion[]>(
  "chat-suggestions",
  [
    {
      id: "1",
      title: "Explain",
      prompt: "Please explain the pages in short",
    },
    {
      id: "2",
      title: "Summarize",
      prompt: "Please summarize the pages in short",
    },
    {
      id: "3",
      title: "Give examples",
      prompt: "Please give examples of topics covered in the pages.",
    },
  ],
);

export const editSuggestionDialogAtom = atom<ChatSuggestion>();
