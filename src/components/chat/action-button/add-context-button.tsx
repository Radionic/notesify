import { Image, Library, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { FileBrowser } from "@/components/file-system/file-browser";
import { TooltipDropdown } from "@/components/tooltip/tooltip-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { FileNode } from "@/db/schema";
import { useAddLibraryContext } from "@/queries/chat/use-pdf-context-upload";

const ContextRow = ({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
}) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      <div className="flex items-center gap-2 cursor-pointer">
        {icon}
        <div className="flex flex-col">
          <div className="text-sm font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
    </DropdownMenuItem>
  );
};

export const AddContextButton = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { mutate: addLibraryContext } = useAddLibraryContext();

  const handleLibraryFileSelected = (file: FileNode) => {
    addLibraryContext(file);
    setLibraryOpen(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
      <TooltipDropdown
        tooltip="Context"
        trigger={<Plus className="h-4 w-4 opacity-50" />}
      >
        <ContextRow
          icon={<Image className="h-4 w-4" />}
          label="Upload images or files"
          onClick={() => fileInputRef.current?.click()}
        />
        <ContextRow
          icon={<Library className="h-4 w-4" />}
          label="Choose from Library"
          onClick={() => setLibraryOpen(true)}
        />
      </TooltipDropdown>
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-3xl w-[90dvw] h-[75dvh] flex flex-col rounded-lg">
          <DialogHeader>
            <DialogTitle>Choose from Library</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto">
            <FileBrowser
              readOnly
              withNavigation={false}
              onFileSelected={handleLibraryFileSelected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
