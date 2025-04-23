import { useAtomValue } from "jotai";
import { rootFilesAtomLoadable } from "@/atoms/file-system/file-system";
import { PdfFileUploader } from "@/components/file-system/file-uploader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Draggable } from "@/components/dnd/draggable";
import { FileSystemItem } from "./file-system-item";
import { DragOverlay } from "@dnd-kit/core";
import { Logo } from "@/components/logo";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme-provider";
import { Button } from "../ui/button";

export const FileSystemSidebar = ({
  withUpload,
  withSheet,
  draggingItemId,
  onClose,
}: {
  withUpload?: boolean;
  withSheet?: boolean;
  draggingItemId?: string | number;
  onClose?: () => void;
}) => {
  const { theme, setTheme } = useTheme()

  const rootFilesLoadable = useAtomValue(rootFilesAtomLoadable);
  if (rootFilesLoadable.state !== "hasData") {
    return null;
  }

  const rootFiles = rootFilesLoadable.data;

  // const draggingItem = rootFiles.find(
  //   (file) => file.type === "pdf" && file.id === draggingItemId
  // );
  const sidebar = (
    <div className="flex flex-col h-dvh px-4 py-2 overflow-y-auto">
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <a href="https://github.com/Radionic/notesify" target="_blank">
            <GitHubLogoIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </a>
        </div>
      </div>

      {withUpload && <PdfFileUploader thin />}
      {rootFiles.length > 0 ? (
        <div>
          {rootFiles
            .filter((file) => file.type === "pdf")
            .map((file) => (
              // <Draggable key={file.id} id={file.id}>
              <FileSystemItem node={file} />
              // </Draggable>
            ))}

          {/* {draggingItem && (
            <DragOverlay key={draggingItem.id}>
              <FileSystemItem node={draggingItem} />
            </DragOverlay>
          )}  */}
        </div>
      ) : (
        <div className="text-muted-foreground">No PDFs found in library</div>
      )}
    </div>
  );

  if (withSheet) {
    return (
      <Sheet
        open={true}
        onOpenChange={(open) => {
          if (!open) onClose?.();
        }}
      >
        <SheetContent side="left" className="pt-10 px-0 w-96 overflow-x-hidden">
          {sidebar}
        </SheetContent>
      </Sheet>
    );
  }

  return sidebar;
};
