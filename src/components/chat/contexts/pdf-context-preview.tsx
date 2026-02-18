import { BsFiletypePdf } from "react-icons/bs";
import { CgClose } from "react-icons/cg";
import type { PdfContext } from "@/atoms/chat/contexts";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useRemovePdfContext } from "@/queries/chat/use-pdf-context-upload";
import { useFile } from "@/queries/file-system/use-file-system";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

export const PdfContextPreview = ({
  context,
  removable,
}: {
  context: PdfContext;
  removable?: boolean;
}) => {
  const { mutate: removeContext, isPending: isDeleting } =
    useRemovePdfContext();
  const { data: file } = useFile({ id: context.fileId });
  const { navigatePdf } = useNavigatePdf();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-card pl-3 py-2 max-w-52",
        isDeleting && "opacity-50",
        removable ? "pr-1.5" : "pr-3",
      )}
    >
      <button
        type="button"
        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer transition-opacity"
        onClick={() => navigatePdf({ pdfId: context.fileId })}
        disabled={isDeleting}
      >
        <BsFiletypePdf className="h-4 w-4 shrink-0 text-blue-500" />
        <p className="truncate text-sm font-medium">{file?.name}</p>
      </button>
      {isDeleting && <Spinner className="h-4 w-4 shrink-0" />}
      {removable && !isDeleting && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={() => removeContext(context.fileId)}
          disabled={isDeleting}
        >
          <CgClose className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
