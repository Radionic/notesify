import type { DynamicToolUIPart } from "ai";
import { useSetAtom } from "jotai";
import { activeBoundingContextAtom } from "@/atoms/chat/contexts";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/id";
import type { Rect } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

type HighlightTextInput = {
  pdfId: string;
  pdfPage: number;
  originalPdfText: string;
};

type HighlightTextOutput = {
  pdfId: string;
  page: number;
  rects: Rect[];
};

export const HighlightTextTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const { navigatePdf } = useNavigatePdf();
  const setActiveBoundingContext = useSetAtom(activeBoundingContextAtom);

  const input = tool.input as HighlightTextInput;

  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";

  const output: HighlightTextOutput | undefined =
    isDone && tool.output && typeof tool.output === "object"
      ? (tool.output as HighlightTextOutput)
      : undefined;

  const rects = output?.rects ?? [];

  const showResult = ({
    rects,
    pdfId,
    page,
  }: {
    rects: Rect[];
    pdfId: string;
    page: number;
  }) => {
    navigatePdf({ pdfId, page });
    setActiveBoundingContext({
      id: generateId(),
      type: "text",
      pdfId,
      page,
      rects,
    });
  };

  const foundCount = rects.length > 0 ? 1 : 0;

  return (
    <div
      className={cn(
        "not-prose my-2 w-full max-w-md rounded-md border border-neutral-200 bg-white/70 dark:bg-panel/60 p-3 space-y-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {isErrored
            ? "Failed to find highlights"
            : !isDone
              ? "Finding highlights..."
              : foundCount > 0
                ? `Found ${foundCount} highlight${foundCount === 1 ? "" : "s"}`
                : "No highlights found"}
        </div>

        {input?.pdfPage != null && (
          <Badge
            variant="gray"
            className="cursor-pointer"
            onClick={() =>
              navigatePdf({ pdfId: input.pdfId, page: input.pdfPage })
            }
          >
            Page {input.pdfPage}
          </Badge>
        )}
      </div>

      {isDone && !isErrored && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-md bg-neutral-50 dark:bg-neutral-900/30 px-2 py-2">
            <div className="min-w-0">
              {input?.originalPdfText && (
                <div className="text-[11px] text-muted-foreground truncate">
                  {input.originalPdfText}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="secondary"
              disabled={rects.length === 0}
              onClick={() =>
                showResult({
                  rects,
                  pdfId: output?.pdfId ?? input.pdfId,
                  page: output?.page ?? input.pdfPage,
                })
              }
            >
              Show
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
