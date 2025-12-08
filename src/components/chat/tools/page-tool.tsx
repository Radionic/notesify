import type { DynamicToolUIPart } from "ai";
import { useAtomValue } from "jotai";
import { CircleAlert } from "lucide-react";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { Badge } from "@/components/badge";
import { PageBadges } from "@/components/chat/tools/page-badges";
import { cn } from "@/lib/utils";
import { useFile } from "@/queries/file-system/use-file-system";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

type PageToolInput = {
  pdfId?: string;
};

export const PageTool = ({
  tool,
  className,
  pages,
  actionText,
}: {
  tool: DynamicToolUIPart;
  className?: string;
  pages: number[];
  actionText: {
    loading: string;
    completed: string;
    failed: string;
  };
}) => {
  const { navigatePdf } = useNavigatePdf();
  const activePdfId = useAtomValue(activePdfIdAtom);

  const { pdfId } = (tool.input as PageToolInput) || {};
  const running = tool.state !== "output-available";
  const { data: pdfFile } = useFile({ id: pdfId });
  const pdfName = pdfFile?.name;

  const renderContent = () => {
    if (running) {
      return (
        <>
          {/* @ts-ignore */}
          <l-ring-2
            size="16"
            stroke="2"
            stroke-length="0.25"
            bg-opacity="0.1"
            speed="0.8"
            color="black"
          />
          {actionText.loading}
        </>
      );
    }

    if (!pdfName) {
      return (
        <>
          <CircleAlert color="orange" className="w-4 h-4" />
          <p>Can't find the PDF</p>
        </>
      );
    }

    if (pages.length === 0) {
      return (
        <>
          <CircleAlert color="orange" className="w-4 h-4" />
          <p>{actionText.failed}</p>
        </>
      );
    }

    return (
      <>
        {actionText.completed}
        <PageBadges
          pages={pages}
          variant="gray"
          className="cursor-pointer truncate"
          onClick={(startPage) => {
            if (!pdfId) return;
            navigatePdf({
              pdfId,
              page: startPage,
            });
          }}
        />
        of
        <Badge
          variant="gray"
          className="cursor-pointer"
          onClick={() => {
            if (!pdfId || pdfId === activePdfId) {
              return;
            }
            navigatePdf({ pdfId });
          }}
        >
          {pdfName}
        </Badge>
      </>
    );
  };

  return (
    <div className={cn("flex items-center gap-2 w-fit text-xs", className)}>
      {renderContent()}
    </div>
  );
};
