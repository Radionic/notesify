import { useAtom, useAtomValue } from "jotai";
import { Pencil } from "lucide-react";

import {
  chatSuggestionsAtom,
  editSuggestionDialogAtom,
} from "@/atoms/chat/chat-suggestions";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { EditSuggestionDialog } from "../../pdf/dialog/edit-suggestion-dialog";

export const QuickActions = () => {
  const suggestions = useAtomValue(chatSuggestionsAtom);
  const [editSuggestion, setEditSuggestion] = useAtom(editSuggestionDialogAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const chatId = useAtomValue(activeChatIdAtom);
  const { append, status } = useChatAI({ chatId, pdfId });
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            <span
              onClick={async () => {
                if (isLoading) return;

                append({
                  role: "user",
                  content: suggestion.prompt,
                });
              }}
            >
              {suggestion.title}
            </span>
            <Pencil
              className="h-3.5 w-3.5 text-neutral-500"
              onClick={() => {
                setEditSuggestion(suggestion);
              }}
            />
          </button>
        ))}
      </div>
      {editSuggestion && <EditSuggestionDialog />}
    </>
  );
};
