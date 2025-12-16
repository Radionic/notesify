import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert } from "lucide-react";
import { useState } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Streamdown } from "streamdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ExtractVisualInfoToolInput = {
  page?: number;
  instruction?: string;
};

export const ExtractVisualInfoTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";

  const input = tool.input as ExtractVisualInfoToolInput | undefined;
  const page = input?.page;
  const instruction = input?.instruction;

  const triggerLabel = isErrored
    ? "Failed to extract info"
    : !isDone
      ? `Extracting info from page ${page ?? "?"}...`
      : `Extracted info from page ${page ?? "?"}`;

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
        <span className="text-left">{triggerLabel}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-md p-2 text-xs space-y-2">
        {instruction && (
          <p className="text-muted-foreground italic">Goal: "{instruction}"</p>
        )}

        {isDone && typeof tool.output === "string" && (
          <Streamdown
            className={cn(
              // Tables
              "[&_table]:overflow-x-auto",
              // Code blocks
              "[&_pre]:overflow-x-auto",
              className,
            )}
            remarkPlugins={[
              [remarkGfm, {}],
              [remarkMath, { singleDollarTextMath: true }],
            ]}
          >
            {tool.output}
          </Streamdown>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
