import type { DynamicToolUIPart } from "ai";
import { Check } from "lucide-react";
import { Badge } from "@/components/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const GetViewingPdfMetadataTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const isDone = tool.state === "output-available";

  return (
    <Badge className={cn("bg-neutral-50 w-fit text-xs px-3 py-2", className)}>
      {isDone && typeof tool.output === "string" ? (
        <>
          <Check color="green" className="h-3 w-3 shrink-0 mr-1" />
          Read viewing PDF metadata
        </>
      ) : (
        <>
          <Spinner className="h-3 w-3 shrink-0 mr-1" />
          Getting PDF metadata...
        </>
      )}
    </Badge>
  );
};
