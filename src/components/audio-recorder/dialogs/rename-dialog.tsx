import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Recording } from "@/db/schema";
import { useRenameRecording } from "@/queries/recording/use-recording";

export const RenameDialog = ({
  isOpen,
  onOpenChange,
  recording,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recording: Recording;
}) => {
  const { mutateAsync: renameRecording } = useRenameRecording();
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (recording && isOpen) {
      setNewName(recording.name);
    }
  }, [recording, isOpen]);

  const handleRename = () => {
    if (newName.trim()) {
      renameRecording({ id: recording?.id, name: newName.trim() });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename Recording</DialogTitle>
          <DialogDescription>
            Enter a new name for your recording.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Recording name"
          className="mt-4"
          autoFocus
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
