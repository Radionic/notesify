import {
  Download,
  FileText,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileNode } from "@/db/schema";

interface FileGridProps {
  files: FileNode[];
  isLoading?: boolean;
  readOnly?: boolean;
  onItemClick: (item: FileNode) => void;
  onRename?: (item: FileNode) => void;
  onDelete?: (item: FileNode) => void;
  onDownload?: (item: FileNode) => void;
}

export const FileGrid = ({
  files,
  isLoading,
  readOnly,
  onItemClick,
  onRename,
  onDownload,
  onDelete,
}: FileGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading...</div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No files or folders found
      </div>
    );
  }

  const folders = files.filter((item) => item.type === "folder");
  const nonFolders = files.filter((item) => item.type !== "folder");

  const renderItem = (item: FileNode) => (
    <button
      type="button"
      key={item.id}
      className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      {item.type === "folder" ? (
        <Folder className="h-5 w-5 text-yellow-500 shrink-0" />
      ) : (
        <FileText className="h-5 w-5 text-red-500 shrink-0" />
      )}
      <span className="text-sm truncate flex-1 text-left">{item.name}</span>

      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
            {onRename && (
              <DropdownMenuItem onClick={() => onRename(item)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
            )}
            {onDownload && item.type === "pdf" && (
              <DropdownMenuItem onClick={() => onDownload(item)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {folders.map(renderItem)}
        </div>
      )}
      {nonFolders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {nonFolders.map(renderItem)}
        </div>
      )}
    </div>
  );
};
