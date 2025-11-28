import { useAtomValue } from "jotai";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { openedPdfIdsAtom } from "@/atoms/pdf/pdf-viewer";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FileNode } from "@/db/schema";
import {
  useRemovePdf,
  useRenamePdf,
} from "@/queries/file-system/use-file-system";
import { useDownloadPdf, useNavigatePdf } from "@/queries/pdf/use-pdf";
import { ItemMenu } from "./item-menu";

export interface FileSystemItemProps {
  node: FileNode;
  level?: number;
}

export const FileSystemItem = ({ node, level = 0 }: FileSystemItemProps) => {
  const openedPdfIds = useAtomValue(openedPdfIdsAtom);
  const [isOpen, setIsOpen] = useState(true);
  // const [children] = useAtom(folderChildrenAtom);
  // const [childNodes, setChildNodes] = useState<FileNode[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  // For pdf only now
  const { mutate: removeNode } = useRemovePdf();
  const { mutate: renameNode } = useRenamePdf();
  const { mutateAsync: downloadPdf } = useDownloadPdf();

  const { navigatePdf } = useNavigatePdf();

  // useEffect(() => {
  //   const loadChildren = async () => {
  //     if (node.type === "folder") {
  //       const nodes = await children(node.id);
  //       setChildNodes(nodes);
  //     }
  //   };
  //   loadChildren();
  // }, [node, children]);

  const handleRename = async () => {
    if (newName.trim() === "") {
      setIsRenaming(false);
      setNewName(node.name);
      return;
    }

    if (newName === node.name) {
      setIsRenaming(false);
      return;
    }

    await renameNode({ pdfId: node.id, newName: newName.trim() });
    setIsRenaming(false);
  };

  const handleDownload = async () => {
    if (node.type !== "pdf" || !node.id) {
      toast.error("Not a PDF file");
      return;
    }
    await downloadPdf({ pdfId: node.id, filename: node.name });
  };

  const handleRemove = async () => {
    if (node.type === "folder") {
      toast.error("Cannot remove folder now");
      return;
    }
    if (node.id && openedPdfIds.includes(node.id)) {
      toast.error("Cannot remove currently opened PDF");
      return;
    }
    await removeNode({ fileId: node.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setNewName(node.name);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 hover:bg-accent/50 h-8 px-0 py-1"
        onClick={async () => {
          // if (node.type === "folder") {
          //   setIsOpen(!isOpen);
          // }
          if (!node.id) return;
          navigatePdf({ pdfId: node.id });
        }}
      >
        <div
          className="flex items-center w-full"
          // style={{ paddingLeft: `${level * 12}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 w-full">
            {node.type === "folder" ? (
              <>
                {isOpen ? (
                  <ChevronDownIcon size={16} />
                ) : (
                  <ChevronRightIcon size={16} />
                )}
                <FolderIcon size={16} />
              </>
            ) : (
              <FileIcon size={16} />
            )}
            {isRenaming ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  setIsRenaming(false);
                  setNewName(node.name);
                }}
                className="h-6 flex-grow"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>
          <div className="ml-auto flex items-center">
            {node.type === "pdf" &&
              node.id &&
              openedPdfIds.includes(node.id) && (
                <Badge variant="green">Opened</Badge>
              )}
            {/* {node.pdfId &&
              openedPdfIds.includes(node.pdfId) &&
              (node.pdfId === activePdfId ? (
                <Badge variant="green">Viewing</Badge>
              ) : (
                <Badge variant="blue">Opened</Badge>
              ))} */}
            <ItemMenu
              node={node}
              onRename={() => setIsRenaming(true)}
              onDownload={handleDownload}
              onRemove={handleRemove}
            />
          </div>
        </div>
      </Button>
      {/* {node.type === "folder" &&
        isOpen &&
        childNodes.map((child) => (
          <FileSystemItem key={child.id} node={child} level={level + 1} />
        ))} */}
    </div>
  );
};
