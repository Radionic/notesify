import { FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileNode } from "@/db/schema";
import { useFiles } from "@/queries/file-system/use-file-system";
import { useNavigateImage } from "@/queries/images/use-images";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";
import { getRouter } from "@/router";
import { FileItem } from "./file-item";

export const FileGrid = ({
  parentId,
  search,
  readOnly,
  withNavigation,
  onFileSelected,
  onFolderNavigate,
  onUpload,
}: {
  parentId: string | null;
  search?: string;
  readOnly?: boolean;
  withNavigation?: boolean;
  onFileSelected?: (file: FileNode) => void;
  onFolderNavigate?: (folderId: string, folderName: string) => void;
  onUpload?: () => void;
}) => {
  const { data, isLoading } = useFiles({
    parentId,
    search,
    includeBreadcrumbs: false,
  });
  const { navigatePdf } = useNavigatePdf();
  const { navigateImage } = useNavigateImage();

  const files = data?.files || [];

  const handleItemClick = (item: FileNode) => {
    if (item.type === "folder") {
      onFolderNavigate?.(item.id, item.name);
      return;
    }
    onFileSelected?.(item);

    if (!withNavigation) return;

    if (item.type === "pdf") {
      navigatePdf({ pdfId: item.id });
    } else if (item.type === "webpage") {
      getRouter().navigate({
        to: "/viewer",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          fid: item.id,
          type: "webpage" as const,
          fo: true,
        }),
      });
    } else if (item.type === "image") {
      navigateImage({ imageId: item.id });
    }
  };

  if (isLoading) {
    return (
      <div className="@container">
        <div className="grid grid-cols-1 @min-[400px]:grid-cols-2 @min-[600px]:grid-cols-3 @min-[800px]:grid-cols-4 @min-[1000px]:grid-cols-5 @min-[1200px]:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-lg border"
            >
              <Skeleton className="h-5 w-5 shrink-0 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 md:pt-64 px-8 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">
          No files or folders
        </p>
        <p className="text-sm text-muted-foreground max-w-xs mb-1">
          <button
            type="button"
            onClick={onUpload}
            className="text-sm font-medium text-blue-500 underline-offset-4 hover:underline cursor-pointer"
          >
            Add a file
          </button>{" "}
          to get started
        </p>
      </div>
    );
  }

  const folders = files.filter((item) => item.type === "folder");
  const nonFolders = files.filter((item) => item.type !== "folder");

  return (
    <div className="@container space-y-4">
      {folders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">
            Folders
          </h2>
          <div className="grid grid-cols-1 @min-[400px]:grid-cols-2 @min-[600px]:grid-cols-3 @min-[800px]:grid-cols-4 @min-[1000px]:grid-cols-5 @min-[1200px]:grid-cols-6 gap-2">
            {folders.map((item) => (
              <FileItem
                key={item.id}
                file={item}
                readOnly={readOnly}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </div>
      )}
      {nonFolders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">
            Files
          </h2>
          <div className="grid grid-cols-1 @min-[400px]:grid-cols-2 @min-[600px]:grid-cols-3 @min-[800px]:grid-cols-4 @min-[1000px]:grid-cols-5 @min-[1200px]:grid-cols-6 gap-2">
            {nonFolders.map((item) => (
              <FileItem
                key={item.id}
                file={item}
                readOnly={readOnly}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
