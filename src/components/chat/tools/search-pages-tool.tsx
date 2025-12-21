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

type SearchPagesInput = {
  pdfId: string;
  query: string;
};

type SearchPageResult = {
  page: number;
  text?: string | null;
};

export const SearchPagesTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";

  const input = tool.input as SearchPagesInput | undefined;
  const query = input?.query ?? "";

  const pages =
    isDone && Array.isArray(tool.output)
      ? (tool.output as SearchPageResult[]).map((o) => o.page)
      : [];

  const hasPages = isDone && pages.length > 0;
  const pageCountLabel =
    pages.length === 1 ? "1 page" : `${pages.length} pages`;
  const shortQuery =
    query.length > 80 ? `${query.slice(0, 77).trimEnd()}...` : query;
  const queryLabel = shortQuery ? `"${shortQuery}"` : "your query";

  const triggerLabel = isErrored
    ? `Failed to read ${pageCountLabel} for ${queryLabel}`
    : !isDone
      ? `Searching pages for ${queryLabel}...`
      : hasPages
        ? `Read ${pageCountLabel} for ${queryLabel}`
        : `No relevant pages found for ${queryLabel}`;

  return (
    <Collapsible
      open={isErrored ? false : open}
      onOpenChange={isErrored ? undefined : setOpen}
      className={cn("not-prose my-1 w-full max-w-md", className)}
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
              loading: "Searching pages",
              completed: "Searched",
              failed: "No relevant pages found",
            }}
            pages={pages}
          />
        )}

        {isDone && !hasPages && !isErrored && (
          <p className="text-muted-foreground">
            No relevant pages found for {queryLabel}.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
