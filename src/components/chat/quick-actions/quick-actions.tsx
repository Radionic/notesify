import { Pencil } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";

import {
  chatSuggestionsAtom,
  editSuggestionDialogAtom,
} from "@/atoms/chat/chat-suggestions";
import { EditSuggestionDialog } from "../../pdf/dialog/edit-suggestion-dialog";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { useChat } from "@/hooks/chat/use-chat";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useAction } from "@/hooks/state/use-action";

export const QuickActions = () => {
  const [getModel] = useAction(getSelectedModelAtom);
  const suggestions = useAtomValue(chatSuggestionsAtom);
  const [editSuggestion, setEditSuggestion] = useAtom(editSuggestionDialogAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const chatId = useAtomValue(activeChatIdAtom);
  const { append, status } = useChat({ chatId, pdfId });
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

                const model = await getModel("Chat");
                if (!model) return;

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
