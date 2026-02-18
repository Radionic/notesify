import type { DynamicToolUIPart } from "ai";
import {
  ChevronRightIcon,
  CircleAlert,
  ExternalLinkIcon,
  GlobeIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type WebSearchInput = {
  query?: string;
};

type WebSearchResultItem = {
  title: string;
  url: string;
  description: string;
};

export const SearchWebTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const hasError = tool.state === "output-error";

  const input = tool.input as WebSearchInput | undefined;
  const query = input?.query;

  const results: WebSearchResultItem[] =
    isDone && Array.isArray(tool.output) ? tool.output : [];

  const triggerLabel = hasError
    ? `Failed to search "${query ?? ""}"`
    : !isDone
      ? `Searching the web for "${query ?? ""}"...`
      : results.length > 0
        ? `Found ${results.length} result${results.length === 1 ? "" : "s"} for "${query ?? ""}"`
        : `No results found for "${query ?? ""}"`;

  return (
    <Collapsible
      open={hasError ? false : open}
      onOpenChange={hasError ? undefined : setOpen}
      className={cn("not-prose my-1 w-full", className)}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        {hasError ? (
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
        <span className="text-left">{triggerLabel}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-md p-2 text-xs space-y-2">
        {isDone && results.length > 0 && (
          <div className="space-y-1.5">
            {results.map((result) => (
              <div key={result.url} className="space-y-0.5 pl-2">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <GlobeIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                  {result.title}
                  <ExternalLinkIcon className="h-2.5 w-2.5 shrink-0" />
                </a>
                {result.description && (
                  <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {isDone && results.length === 0 && !hasError && (
          <p className="text-muted-foreground">
            No results found for "{query}".
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
