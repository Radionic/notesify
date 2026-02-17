import { FolderPlus, Plus, Search, Upload } from "lucide-react";
import { useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useAddFolder } from "@/queries/file-system/use-file-system";
import { FileBreadcrumb, type PathItem } from "./file-breadcrumb";
import { FileGrid } from "./file-grid";
import { FilesUploader } from "./file-uploader";

export const FileBrowser = ({
  readOnly,
  onFileSelected,
  initialSearch,
  onSearchChanged,
  initialFolderId,
  onFolderIdChanged,
}: {
  readOnly?: boolean;
  onFileSelected?: (fileId: string) => void;
  initialSearch?: string;
  onSearchChanged?: (value: string) => void;
  initialFolderId?: string | null;
  onFolderIdChanged?: (folderId: string | null) => void;
}) => {
  const [path, setPath] = useState<PathItem[]>([{ id: null, name: "Library" }]);
  const isInitialized = useRef(!initialFolderId);

  const [folderDialog, setFolderDialog] = useState<{ name: string } | null>(
    null,
  );
  const [uploadDialog, setUploadDialog] = useState(false);

  const [debouncedQuery, setQuery] = useDebounceValue(initialSearch, 500);
  const currentFolderId = isInitialized.current
    ? path[path.length - 1].id
    : (initialFolderId ?? null);

  const { mutateAsync: addFolder, isPending: isCreatingFolder } =
    useAddFolder();

  const handleCreateFolderSubmit = async () => {
    if (!folderDialog?.name.trim()) return;
    await addFolder({
      name: folderDialog.name.trim(),
      parentId: currentFolderId,
    });
    setFolderDialog(null);
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

  const handleFolderNavigate = (folderId: string, folderName: string) => {
    const newPath = [...path, { id: folderId, name: folderName }];
    setPath(newPath);
    onFolderIdChanged?.(folderId);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:gap-4 gap-2 mb-4">
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
            autoFocus={false}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
        </InputGroup>

        {/* Actions */}
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFolderDialog({ name: "" })}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Grid */}
      <FileGrid
        parentId={currentFolderId}
        search={debouncedQuery}
        readOnly={readOnly}
        onFileSelected={onFileSelected}
        onFolderNavigate={handleFolderNavigate}
        onUpload={() => setUploadDialog(true)}
      />

      {/* Create Folder Dialog */}
      {!!folderDialog && (
        <Dialog
          open={!!folderDialog}
          onOpenChange={(open) =>
            !open && !isCreatingFolder && setFolderDialog(null)
          }
        >
          <DialogContent className="w-md max-w-[90dvw] rounded-lg">
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for the new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="folder-name">Name</Label>
              <Input
                id="folder-name"
                placeholder="Folder name"
                value={folderDialog?.name ?? ""}
                onChange={(e) => setFolderDialog({ name: e.target.value })}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCreateFolderSubmit()
                }
                disabled={isCreatingFolder}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFolderDialog(null)}
                disabled={isCreatingFolder}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolderSubmit}
                disabled={isCreatingFolder}
              >
                {isCreatingFolder ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Dialog */}
      {uploadDialog && (
        <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
          <DialogContent className="w-md max-w-[90dvw] rounded-lg">
            <DialogHeader>
              <DialogTitle>Upload files</DialogTitle>
            </DialogHeader>
            <FilesUploader parentId={currentFolderId} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
