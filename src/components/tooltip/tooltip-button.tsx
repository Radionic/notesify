import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { ReactNode } from "@tanstack/react-router";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const TooltipButton = ({
  tooltip,
  shortcut,
  children,
  active,
  className,
  ...rest
}: {
  tooltip: string;
  shortcut?: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
} & ButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className={cn(
              "p-2 w-fit h-fit",
              active &&
                "bg-buttonblue/80 text-blue-500 hover:text-blue-600 hover:bg-buttonblue",
              className,
            )}
            {...rest}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="z-30">
          <p>{tooltip}</p>
          {shortcut && (
            <p className="text-[0.6rem] text-muted-foreground">{shortcut}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
