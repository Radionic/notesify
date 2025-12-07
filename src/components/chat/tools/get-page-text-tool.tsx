import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { PageTool } from "./page-tool";

type GetPageTextInput = {
  startPage: number;
  endPage: number;
};

export const GetPageTextTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";

  const input = tool.input as GetPageTextInput | undefined;
  if (!input) return null;

  const { startPage, endPage } = input;
  if (startPage == null || endPage == null) return null;

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const hasPages = isDone && pages.length > 0;
  const pageCountLabel =
    pages.length === 1 ? "1 page" : `${pages.length} pages`;

  const triggerLabel = isErrored
    ? `Failed to read ${pageCountLabel}`
    : !isDone
      ? `Reading ${pageCountLabel}...`
      : hasPages
        ? `Read ${pageCountLabel}`
        : `No text found in these pages`;

  return (
    <Collapsible
      open={isErrored ? false : open}
      onOpenChange={isErrored ? undefined : setOpen}
      className={cn("not-prose my-2 w-full max-w-md", className)}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        {isErrored ? (
          <CircleAlert className="h-3 w-3 shrink-0" />
        ) : isDone ? (
          <ChevronRightIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
        ) : (
          <Spinner className="h-3 w-3 shrink-0" />
        )}
        <span>{triggerLabel}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-md p-2 text-xs space-y-2">
        {isDone && hasPages && (
          <PageTool
            tool={tool}
            actionText={{
              loading: "Reading pages",
              completed: "Read",
              failed: "Failed to read pages",
            }}
            pages={pages}
          />
        )}

        {isDone && !hasPages && !isErrored && (
          <p className="text-muted-foreground">No text found in these pages.</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
