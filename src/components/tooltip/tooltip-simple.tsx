import type { ReactNode } from "@tanstack/react-router";
import { useState } from "react";
import type { ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const TooltipSimple = ({
  tooltip,
  shortcut,
  children,
  className,
}: {
  tooltip: string;
  shortcut?: string;
  children: ReactNode;
  className?: string;
} & ButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open}>
      <TooltipTrigger className="cursor-pointer" asChild>
        <button
          type="button"
          className={cn("cursor-pointer", className)}
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onTouchStart={() => setOpen(!open)}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
        {shortcut && (
          <p className="text-[0.6rem] text-muted-foreground">{shortcut}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
