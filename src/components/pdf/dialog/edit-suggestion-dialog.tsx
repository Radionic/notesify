import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import {
  chatSuggestionsAtom,
  editSuggestionDialogAtom,
} from "@/atoms/chat/chat-suggestions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EditSuggestionDialog = () => {
  const [suggestions, setSuggestions] = useAtom(chatSuggestionsAtom);
  const [suggestion, setSuggestion] = useAtom(editSuggestionDialogAtom);

  const [title, setTitle] = useState(suggestion?.title ?? "");
  const [prompt, setPrompt] = useState(suggestion?.prompt ?? "");

  const handleSave = () => {
    if (!suggestion) return;
    setSuggestions(
      suggestions.map((s) =>
        s.id === suggestion.id ? { ...s, title, prompt } : s,
      ),
    );
    setSuggestion(undefined);
    toast.success("Quick action updated");
  };

  return (
    <Dialog
      open={Boolean(suggestion)}
      onOpenChange={(open) => !open && setSuggestion(undefined)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quick Action</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quick action title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the prompt to use"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setSuggestion(undefined)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
