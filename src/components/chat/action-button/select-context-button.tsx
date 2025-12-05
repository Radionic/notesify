import { useAtom, useAtomValue } from "jotai";
import { Crop, File, SquareMousePointer, Type } from "lucide-react";
import { toast } from "sonner";
import { selectContextModeAtom } from "@/atoms/pdf/pdf-viewer";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { TooltipDropdown } from "@/components/tooltip/tooltip-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ensureVisionModel } from "@/lib/ai/ensure-vision-model";

const ContextRow = ({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
}) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      <div className="flex items-center gap-2 cursor-pointer">
        {icon}
        <div className="flex flex-col">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </DropdownMenuItem>
  );
};

export const SelectAreaContextButton = () => {
  const [mode, setMode] = useAtom(selectContextModeAtom);
  const selectedModel = useAtomValue(selectedModelAtom);

  return (
    <TooltipDropdown
      tooltip="Context"
      active={mode !== undefined}
      trigger={<SquareMousePointer className="h-4 w-4 opacity-50" />}
    >
      <ContextRow
        icon={<Type className="h-4 w-4" />}
        label="Select Text"
        description="Add text as context"
        onClick={() => {
          toast.info(
            "Select text in PDF and click 'Ask AI' to add as context",
            {
              position: "top-right",
            },
          );
        }}
      />
      <ContextRow
        icon={<Crop className="h-4 w-4" />}
        label="Select Area"
        description="Add area as context"
        onClick={() => {
          if (!ensureVisionModel({ model: selectedModel })) {
            return;
          }
          setMode("area");
        }}
      />
      <ContextRow
        icon={<File className="h-4 w-4" />}
        label="Select Page"
        description="Add page as context"
        onClick={() => {
          if (!ensureVisionModel({ model: selectedModel })) {
            return;
          }
          setMode("page");
        }}
      />
    </TooltipDropdown>
  );
};
