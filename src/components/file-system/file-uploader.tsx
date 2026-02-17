import { Plus, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { generateId } from "@/lib/id";
import { cn } from "@/lib/utils";
import { FilesUploaderItem } from "./files-uploader-item";

const MAX_FILE_SIZE = 1024 * 1024 * 50;

export const FilesUploader = ({
  className,
  thin,
  parentId = null,
}: {
  className?: string;
  thin?: boolean;
  parentId?: string | null;
}) => {
  const [queue, setQueue] = useState<{ id: string; file: File }[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        const nextItems = acceptedFiles.map((file) => ({
          id: generateId(),
          file,
        }));
        setQueue((prev) => [...prev, ...nextItems]);
      }

      rejectedFiles.forEach((rejectedFile) => {
        const rejection = rejectedFile.errors[0];
        if (!rejection) {
          return;
        }

        if (rejection.code === "file-too-large") {
          toast.error("PDF file too large. Max size is 50MB");
          return;
        }

        if (rejection.code === "file-invalid-type") {
          toast.error("Only PDF files are supported right now");
          return;
        }

        toast.error(rejection.message);
      });
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      maxFiles: 10,
      maxSize: MAX_FILE_SIZE,
      multiple: true,
      accept: {
        "application/pdf": [".pdf"],
      },
      onDrop,
    });

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 text-center transition-colors",
          thin ? "min-h-12 py-2" : "min-h-44 py-6",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
        )}
      >
        <input {...getInputProps()} />
        {thin ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Plus className="h-4 w-4" />
            Add files
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border bg-background text-muted-foreground">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag and drop files
              </p>
              <p className="text-xs text-muted-foreground">
                or click to select multiple files
              </p>
            </div>
          </div>
        )}
      </div>

      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => (
            <FilesUploaderItem
              key={item.id}
              uploadKey={item.id}
              file={item.file}
              parentId={parentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
