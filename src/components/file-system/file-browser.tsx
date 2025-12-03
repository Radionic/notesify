import { useSearch } from "@tanstack/react-router";
import { FolderPlus, Upload } from "lucide-react";
import { useState } from "react";
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
import type { FileNode } from "@/db/schema";
import {
  useAddFolder,
  useFiles,
  useRemoveFile,
  useRenameFile,
} from "@/queries/file-system/use-file-system";
import { useDownloadPdf, useNavigatePdf } from "@/queries/pdf/use-pdf";
import { FileBreadcrumb, type PathItem } from "./file-breadcrumb";
import { FileGrid } from "./file-grid";
import { FileSearch } from "./file-search";
import { PdfFileUploader } from "./file-uploader";

export const FileBrowser = ({
  className,
  readOnly,
  onPdfSelected,
}: {
  className?: string;
  readOnly?: boolean;
  onPdfSelected?: (pdfId: string) => void;
}) => {
  const [path, setPath] = useState<PathItem[]>([{ id: null, name: "Library" }]);
  const [renameDialog, setRenameDialog] = useState<{
    file: FileNode;
    newName: string;
  } | null>(null);
  const [folderDialog, setFolderDialog] = useState<{ name: string } | null>(
    null,
  );
  const [uploadDialog, setUploadDialog] = useState(false);

  const searchParams = useSearch({ from: "/library/" });
  const currentFolderId = path[path.length - 1].id;
  const { data: files = [], isLoading } = useFiles({
    parentId: currentFolderId,
    search: searchParams.q,
  });

  const { mutate: addFolder } = useAddFolder();
  const { mutate: removeFile } = useRemoveFile();
  const { mutate: renameFile } = useRenameFile();
  const { mutate: downloadPdf } = useDownloadPdf();
  const { navigatePdf } = useNavigatePdf();

  const handleCreateFolderSubmit = () => {
    if (!folderDialog?.name.trim()) return;
    addFolder({ name: folderDialog.name.trim(), parentId: currentFolderId });
    setFolderDialog(null);
  };

  const handleItemClick = (item: FileNode) => {
    if (item.type === "folder") {
      setPath([...path, { id: item.id, name: item.name }]);
    } else if (item.type === "pdf") {
      navigatePdf({ pdfId: item.id });
      onPdfSelected?.(item.id);
    }
  };

  const handleDelete = (item: FileNode) => {
    removeFile({
      fileId: item.id,
      parentId: currentFolderId,
      type: item.type,
    });
  };

  const handleDownload = (item: FileNode) => {
    if (item.type !== "pdf") return;
    downloadPdf({ pdfId: item.id, filename: item.name });
  };

  const handleRenameSubmit = () => {
    if (!renameDialog || !renameDialog.newName.trim()) return;
    renameFile({
      id: renameDialog.file.id,
      parentId: currentFolderId,
      newName: renameDialog.newName.trim(),
    });
    setRenameDialog(null);
  };

  const navigateToBreadcrumb = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <FileBreadcrumb path={path} onNavigate={navigateToBreadcrumb} />

        <div className="grow" />

        <FileSearch />

        {!readOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFolderDialog({ name: "" })}
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              New Folder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialog(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload PDF
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <FileGrid
        files={files}
        isLoading={isLoading}
        readOnly={readOnly}
        onItemClick={handleItemClick}
        onRename={
          readOnly
            ? undefined
            : (item) => setRenameDialog({ file: item, newName: item.name })
        }
        onDelete={readOnly ? undefined : handleDelete}
        onDownload={handleDownload}
      />

      {/* Rename Dialog */}
      <Dialog
        open={!!renameDialog}
        onOpenChange={(open) => !open && setRenameDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {renameDialog?.file.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={renameDialog?.newName ?? ""}
            onChange={(e) =>
              renameDialog &&
              setRenameDialog({ ...renameDialog, newName: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog
        open={!!folderDialog}
        onOpenChange={(open) => !open && setFolderDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderDialog?.name ?? ""}
            onChange={(e) => setFolderDialog({ name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolderSubmit()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolderSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
          </DialogHeader>
          <PdfFileUploader parentId={currentFolderId} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
