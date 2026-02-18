import {
  Download,
  FileText,
  Folder,
  Globe,
  Image,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { BsFiletypePdf } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FileNode } from "@/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  useRemoveFile,
  useRenameFile,
} from "@/queries/file-system/use-file-system";
import { useDownloadImage } from "@/queries/images/use-images";
import { useDownloadPdf } from "@/queries/pdf/use-pdf";

export const FileItem = ({
  file,
  readOnly,
  onItemClick,
}: {
  file: FileNode;
  readOnly?: boolean;
  onItemClick?: (file: FileNode) => void;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const isMobile = useIsMobile();

  const { mutateAsync: removeFile, isPending: isDeleting } = useRemoveFile();
  const { mutateAsync: renameFile, isPending: isRenaming } = useRenameFile();
  const { mutateAsync: downloadPdf, isPending: isDownloadingPdf } =
    useDownloadPdf();
  const { mutateAsync: downloadImage, isPending: isDownloadingImage } =
    useDownloadImage();

  const isLoading =
    isDeleting || isDownloadingPdf || isDownloadingImage || isRenaming;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await removeFile({
        fileId: file.id,
        parentId: file.parentId,
        type: file.type,
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (file.type === "pdf") {
        await downloadPdf({ pdfId: file.id, filename: file.name });
      } else if (file.type === "image") {
        await downloadImage({
          imageId: file.id,
          filename: `${file.name}.${file.extension || "png"}`,
        });
      }
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(file.name);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!newName.trim()) return;
    await renameFile({
      id: file.id,
      parentId: file.parentId,
      newName: newName.trim(),
    });
    setRenameDialogOpen(false);
  };

  const getIcon = () => {
    if (file.type === "folder") {
      return <Folder className="h-4 w-4 text-yellow-500 shrink-0" />;
    }
    if (file.type === "pdf") {
      return <BsFiletypePdf className="h-4 w-4 text-blue-500 shrink-0" />;
    }
    if (file.type === "webpage") {
      return <Globe className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
    if (file.type === "image") {
      return <Image className="h-4 w-4 text-purple-500 shrink-0" />;
    }
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  };

  const canDownload = file.type === "pdf" || file.type === "image";

  return (
    <button
      type="button"
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg border bg-card transition-colors cursor-pointer hover:bg-accent/50",
        isLoading && "opacity-50 cursor-not-allowed",
      )}
      onClick={() => !isLoading && onItemClick?.(file)}
      disabled={isLoading}
    >
      {getIcon()}
      <span className="text-sm truncate flex-1 text-left">{file.name}</span>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        !readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-opacity",
                  !isMobile && "opacity-0 group-hover:opacity-100",
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenameClick}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              {canDownload && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      )}

      {renameDialogOpen && (
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                Rename {file.type === "folder" ? "Folder" : "File"}
              </DialogTitle>
              <DialogDescription>
                Enter a new name for this{" "}
                {file.type === "folder" ? "folder" : "file"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button onClick={handleRenameSubmit} disabled={isRenaming}>
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                Delete {file.type === "folder" ? "Folder" : "File"}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{file.name}"? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </button>
  );
};
