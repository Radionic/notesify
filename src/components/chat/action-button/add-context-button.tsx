import { Image, Plus } from "lucide-react";
import { useRef } from "react";
import { TooltipDropdown } from "@/components/tooltip/tooltip-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const ContextRow = ({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
}) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      <div className="flex items-center gap-2 cursor-pointer">
        {icon}
        <div className="flex flex-col">
          <div className="text-sm font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
    </DropdownMenuItem>
  );
};

export const AddContextButton = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
      <TooltipDropdown
        tooltip="Context"
        trigger={<Plus className="h-4 w-4 opacity-50" />}
      >
        <ContextRow
          icon={<Image className="h-4 w-4" />}
          label="Upload Image"
          onClick={() => fileInputRef.current?.click()}
        />
      </TooltipDropdown>
    </>
  );
};
