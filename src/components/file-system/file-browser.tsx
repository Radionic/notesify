import { FolderPlus, Search, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { PdfFileUploader } from "./file-uploader";

export const FileBrowser = ({
  className,
  readOnly,
  onPdfSelected,
  initialSearch,
  onSearchChanged,
  initialFolderId,
  onFolderIdChanged,
}: {
  className?: string;
  readOnly?: boolean;
  onPdfSelected?: (pdfId: string) => void;
  initialSearch?: string;
  onSearchChanged?: (value: string) => void;
  initialFolderId?: string | null;
  onFolderIdChanged?: (folderId: string | null) => void;
}) => {
  const [path, setPath] = useState<PathItem[]>([{ id: null, name: "Library" }]);
  const isInitialized = useRef(!initialFolderId);

  const [renameDialog, setRenameDialog] = useState<{
    file: FileNode;
    newName: string;
  } | null>(null);
  const [folderDialog, setFolderDialog] = useState<{ name: string } | null>(
    null,
  );
  const [uploadDialog, setUploadDialog] = useState(false);

  const [debouncedQuery, setQuery] = useDebounceValue(initialSearch, 500);
  const currentFolderId = isInitialized.current
    ? path[path.length - 1].id
    : (initialFolderId ?? null);
  const { data, isLoading } = useFiles({
    parentId: currentFolderId,
    search: debouncedQuery,
    // Only fetch breadcrumbs on initial page load, not on every navigation
    includeBreadcrumbs: !isInitialized.current,
  });

  // Initialize path from breadcrumbs when we have an initialFolderId
  useEffect(() => {
    if (!isInitialized.current && data?.breadcrumbs) {
      const newPath: PathItem[] = [{ id: null, name: "Library" }];
      for (const crumb of data.breadcrumbs) {
        newPath.push({ id: crumb.id, name: crumb.name });
      }
      setPath(newPath);
      isInitialized.current = true;
    }
  }, [data?.breadcrumbs]);

  const { mutateAsync: addFolder } = useAddFolder();
  const { mutateAsync: removeFile } = useRemoveFile();
  const { mutateAsync: renameFile } = useRenameFile();
  const { mutateAsync: downloadPdf } = useDownloadPdf();
  const { navigatePdf } = useNavigatePdf();

  const handleCreateFolderSubmit = () => {
    if (!folderDialog?.name.trim()) return;
    toast.promise(
      addFolder({ name: folderDialog.name.trim(), parentId: currentFolderId }),
      {
        loading: "Creating...",
        success: "Created folder successfully",
        error: "Failed to create folder",
      },
    );
    setFolderDialog(null);
  };

  const handleItemClick = (item: FileNode) => {
    if (item.type === "folder") {
      const newPath = [...path, { id: item.id, name: item.name }];
      setPath(newPath);
      onFolderIdChanged?.(item.id);
    } else if (item.type === "pdf") {
      navigatePdf({ pdfId: item.id });
      onPdfSelected?.(item.id);
    }
  };

  const handleDelete = (item: FileNode) => {
    toast.promise(
      removeFile({
        fileId: item.id,
        parentId: currentFolderId,
        type: item.type,
      }),
      {
        loading: "Deleting...",
        success: "Deleted successfully",
        error: "Failed to delete",
      },
    );
  };

  const handleDownload = (item: FileNode) => {
    if (item.type !== "pdf") return;
    downloadPdf({ pdfId: item.id, filename: item.name });
  };

  const handleRenameSubmit = () => {
    if (!renameDialog || !renameDialog.newName.trim()) return;
    toast.promise(
      renameFile({
        id: renameDialog.file.id,
        parentId: currentFolderId,
        newName: renameDialog.newName.trim(),
      }),
      {
        loading: "Renaming...",
        success: "Renamed successfully",
        error: "Failed to rename",
      },
    );
    setRenameDialog(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChanged?.(value);
  };

  const handleBreadcrumbNavigate = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    onFolderIdChanged?.(newPath[newPath.length - 1].id);
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {debouncedQuery ? (
          <h1 className="text-lg font-semibold">
            Library{" "}
            <span className="text-muted-foreground font-normal">
              (Search Results)
            </span>
          </h1>
        ) : (
          <FileBreadcrumb path={path} onNavigate={handleBreadcrumbNavigate} />
        )}

        <div className="grow" />

        {/* Search */}
        <InputGroup className="w-full sm:w-64">
          <InputGroupInput
            placeholder="Search..."
            defaultValue={debouncedQuery}
            onChange={handleSearchChange}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>

        {/* Actions */}
        {!readOnly && (
          <div className="flex gap-2 w-full sm:w-auto">
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
        files={data?.files || []}
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
