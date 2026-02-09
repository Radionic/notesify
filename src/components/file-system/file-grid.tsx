import {
  Download,
  FileText,
  Folder,
  Globe,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-6 w-6 shrink-0 rounded" />
            <Skeleton className="h-5 flex-1 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">
          No files or folders
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Upload a file or create a folder to get started
        </p>
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
      ) : item.type === "webpage" ? (
        <Globe className="h-5 w-5 text-blue-500 shrink-0" />
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
