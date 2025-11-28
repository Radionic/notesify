import { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TooltipButton } from "./tooltip-button";
import { cn } from "@/lib/utils";
import { ButtonProps } from "../ui/button";

export type TooltipSelectItem = {
  value: string;
  label: string;
};

export const TooltipDropdown = ({
  tooltip,
  trigger,
  active,
  children,
  ...rest
}: {
  tooltip: string;
  trigger: ReactNode;
  active?: boolean;
  children: ReactNode;
} & ButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TooltipButton
          tooltip={tooltip}
          className={cn(active && "bg-muted")}
          {...rest}
        >
          {trigger}
        </TooltipButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};
