import { CircleAlert, Info } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ToolStateMessageProps = {
  type: "loading" | "error" | "empty";
  message: string;
  className?: string;
};

export const ToolStateMessage = ({
  type,
  message,
  className,
}: ToolStateMessageProps) => {
  return (
    <div className={cn("not-prose my-2 w-full", className)}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {type === "loading" && <Spinner className="h-3 w-3 shrink-0" />}
        {type === "empty" && <Info className="h-3 w-3 shrink-0" />}
        {type === "error" && <CircleAlert className="h-3 w-3 shrink-0" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
