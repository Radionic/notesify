import { Square } from "lucide-react";
import { LuArrowUp } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SendButton = ({
  disabled,
  isLoading,
  onClick,
}: {
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Button
      type="submit"
      className={cn(
        "h-8 w-8 rounded-full transition-colors",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
          : "cursor-pointer bg-blue-500 text-white hover:bg-blue-500/90",
        isLoading &&
          "text-neutral-50 bg-red-500 hover:bg-red-500 hover:text-neutral-50 cursor-pointer",
      )}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      {isLoading ? <Square strokeWidth={2} /> : <LuArrowUp strokeWidth={2} />}
    </Button>
  );
};
