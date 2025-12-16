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
  expressions: string[];
};

export const CalculateTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [texs, setTexs] = useState<string[]>([]);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";
  const [open, setOpen] = useState(false);

  const expressions = (tool.input as CalculateInput)?.expressions || [];

  useEffect(() => {
    try {
      if (!isDone) return;

      const newTexs = expressions.map((expression, i) => {
        try {
          const left = parse(expression).toTex();
          const outputs = Array.isArray(tool.output)
            ? tool.output
            : [tool.output];
          const result = outputs[i];
          if (result !== undefined) {
            const right = parse(String(result)).toTex();
            return `${left} = ${right}`;
          }
          return left;
        } catch (e) {
          console.error("Failed to parse expression", expression, e);
          return "";
        }
      });

      setTexs(newTexs);
    } catch (e) {
      console.error(e);
      setTexs([]);
    }
  }, [isDone, expressions, tool.output]);

  const count = expressions.length;
  let labelText = "expression";

  if (count === 1) {
    const expr = expressions[0];
    labelText = expr.length > 50 ? `${expr.slice(0, 47).trimEnd()}...` : expr;
  } else if (count > 1) {
    labelText = `${count} expressions`;
  }

  const triggerLabel = isErrored
    ? `Failed to calculate ${labelText}`
    : !isDone
      ? `Calculating ${labelText}...`
      : `Calculated ${labelText}`;

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
        {texs.map((tex) => (
          <Badge key={tex} className="bg-neutral-50 w-fit text-[11px] block">
            <InlineMath>{tex}</InlineMath>
          </Badge>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
