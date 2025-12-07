import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert } from "lucide-react";
import { parse } from "mathjs";
import { useEffect, useState } from "react";
import { InlineMath } from "react-katex";
import { Badge } from "@/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// import "@/styles/katex.css";

type CalculateInput = {
  expression: string;
};

export const CalculateTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const { expression = "" } = (tool.input as CalculateInput | undefined) || {};
  const [tex, setTex] = useState<string>("");
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const left = parse(expression).toTex();
      if (isDone) {
        const right = parse(String(tool.output)).toTex();
        setTex(`${left} = ${right}`);
      } else {
        setTex(left);
      }
    } catch (e) {
      console.error(e);
      setTex("");
    }
  }, [isDone, expression, tool.output]);

  const shortExpression =
    expression.length > 80
      ? `${expression.slice(0, 77).trimEnd()}...`
      : expression;

  const triggerLabel = isErrored
    ? `Failed to calculate ${shortExpression || "expression"}`
    : !isDone
      ? `Calculating ${shortExpression || "expression"}...`
      : `Calculated ${shortExpression || "expression"}`;

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
        {tex && (
          <Badge className="bg-neutral-50 w-fit text-[11px]">
            <InlineMath>{tex}</InlineMath>
          </Badge>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
