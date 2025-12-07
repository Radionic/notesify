import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type TocSection = {
  id?: string;
  pdfId?: string;
  type?: string;
  startPage?: number | null;
  endPage?: number | null;
  title?: string | null;
  content?: string | null;
};

export const GetTableOfContentsTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    if (isDone || isErrored) {
      setShowSlowHint(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowSlowHint(true);
    }, 20000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isDone, isErrored]);

  const triggerLabel = isErrored
    ? "Failed to read Table of Contents"
    : !isDone
      ? "Reading Table of Contents..."
      : "Read Table of Contents";

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
        <span>
          {triggerLabel}{" "}
          {!isDone &&
            !isErrored &&
            showSlowHint &&
            "(It may take up to a minute the first time for this PDF.)"}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-md p-2 text-xs space-y-2">
        {isDone && typeof tool.output === "string" && (
          <p className="text-muted-foreground">{tool.output}</p>
        )}

        {isDone && Array.isArray(tool.output) && tool.output.length === 0 && (
          <p className="text-muted-foreground">No sections found.</p>
        )}

        {isDone &&
          Array.isArray(tool.output) &&
          (tool.output as TocSection[]).map((section, index) => {
            const start = section.startPage ?? undefined;
            const end = section.endPage ?? start;
            const hasPages = start != null;
            const pageLabel = hasPages
              ? start === end
                ? `Page ${start}`
                : `Pages ${start}-${end}`
              : undefined;

            const title = section.title || pageLabel || `Section ${index + 1}`;
            const summary = section.content ?? "";

            return (
              <div key={section.id ?? index} className="space-y-0.5 pl-2">
                <div className="font-medium">
                  {title}
                  {pageLabel && (
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      ({pageLabel})
                    </span>
                  )}
                </div>
                {summary && (
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {summary}
                  </p>
                )}
              </div>
            );
          })}
      </CollapsibleContent>
    </Collapsible>
  );
};
