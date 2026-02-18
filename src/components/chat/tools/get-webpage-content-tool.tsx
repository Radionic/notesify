import type { DynamicToolUIPart } from "ai";
import { CircleAlert, GlobeIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const GetWebpageContentTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const isDone = tool.state === "output-available";
  const hasError = tool.state === "output-error";

  const label = hasError
    ? "Failed to get webpage content"
    : !isDone
      ? "Reading webpage content..."
      : "Read webpage content";

  return (
    <div
      className={cn(
        "not-prose my-1 flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {hasError ? (
        <CircleAlert className="h-3 w-3 shrink-0" />
      ) : !isDone ? (
        <Spinner className="h-3 w-3 shrink-0" />
      ) : (
        <GlobeIcon className="h-3 w-3 shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
};
