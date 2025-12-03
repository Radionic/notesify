import type { DynamicToolUIPart } from "ai";
import { parse } from "mathjs";
import { useEffect, useState } from "react";
import { InlineMath } from "react-katex";
import { Badge } from "@/components/badge";
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
  const hasResult = tool.state === "output-available";

  useEffect(() => {
    try {
      const left = parse(expression).toTex();
      if (hasResult) {
        const right = parse(String(tool.output)).toTex();
        setTex(`${left} = ${right}`);
      } else {
        setTex(left);
      }
    } catch (e) {
      console.error(e);
      setTex("");
    }
  }, [hasResult, expression, tool.output]);

  return (
    <Badge className={cn("bg-neutral-50 mt-2 w-fit", className)}>
      <InlineMath>{tex}</InlineMath>
    </Badge>
  );
};
