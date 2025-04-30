import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { RenameDialog } from "./dialogs/rename-dialog";
import { DeleteDialog } from "./dialogs/delete-dialog";
import { Recording } from "@/db/schema";
import { useAtom } from "jotai";
import { selectedRecordingIdAtom } from "@/atoms/recording/audio-recorder";

export const RecordingItemMenu = ({ recording }: { recording: Recording }) => {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(
    selectedRecordingIdAtom
  );
  const isSelected = selectedRecordingId === recording.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecordingId(recording.id);
              setIsRenameDialogOpen(true);
            }}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecordingId(recording.id);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isSelected && isRenameDialogOpen && (
        <RenameDialog
          isOpen={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
          recording={recording}
        />
      )}
      {isSelected && isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          recording={recording}
        />
      )}
    </>
  );
};
