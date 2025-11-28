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
        "rounded-full w-8 h-8 transition-colors duration-500",
        disabled
          ? "text-neutral-500 bg-white cursor-not-allowed"
          : "text-neutral-50 bg-blue-500 hover:bg-blue-500 hover:text-neutral-50",
        isLoading &&
          "text-neutral-50 bg-red-500 hover:bg-red-500 hover:text-neutral-50 cursor-pointer",
      )}
      variant="outline"
      size="icon"
      onClick={onClick}
    >
      {isLoading ? <Square strokeWidth={2} /> : <LuArrowUp strokeWidth={2} />}
    </Button>
  );
};
