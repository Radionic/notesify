import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert, ExternalLinkIcon, GlobeIcon } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type FetchWebContentInput = {
  urls?: string[];
};

type FetchWebContentResult = {
  title: string;
  url: string;
  content: string;
};

export const FetchWebContentTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const hasError = tool.state === "output-error";

  const input = tool.input as FetchWebContentInput | undefined;
  const urls = input?.urls ?? [];
  const urlCount = urls.length;

  const results: FetchWebContentResult[] =
    isDone && Array.isArray(tool.output) ? tool.output : [];

  const urlCountLabel = urlCount === 1 ? "from 1 web URL" : `from ${urlCount} web URLs`;

  const triggerLabel = hasError
    ? `Failed to retrieve content ${urlCountLabel}`
    : !isDone
      ? `Retrieving content ${urlCountLabel}...`
      : results.length > 0
        ? `Retrieved content ${urlCountLabel}`
        : `No content retrieved ${urlCountLabel}`;

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
                  {result.title || result.url}
                  <ExternalLinkIcon className="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>
            ))}
          </div>
        )}

        {isDone && results.length === 0 && !hasError && (
          <p className="text-muted-foreground">
            No content retrieved from the web URLs.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
