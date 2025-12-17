import { useAtom, useAtomValue } from "jotai";

import {
  highlightColorsAtom,
  selectedHighlightColorAtom,
} from "@/atoms/pdf/highlight-options";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange?: (color: string) => void;
};
export const HighlightOptions = ({ value, onChange }: Props) => {
  const colors = useAtomValue(highlightColorsAtom);
  const [selectedColor, setSelectedColor] = useAtom(selectedHighlightColorAtom);

  const currentColor = value ?? selectedColor;

  // const [mode, setMode] = useState<"view" | "edit">("view");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="w-4 h-4 rounded cursor-pointer shadow"
          style={{ backgroundColor: currentColor }}
          onPointerDown={(e) => {
            // Avoid text selection collapses
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        className="min-w-0 w-fit z-200 px-3 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="icon"
                className={cn(
                  "h-4 w-4 rounded cursor-pointer shadow",
                  currentColor === color &&
                    "ring-1 ring-neutral-300 ring-offset-2",
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  onChange?.(color);
                }}
              />
            ))}
          </div>
          {/* {mode === "edit" ? (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-neutral-800 focus:outline-0 hover:ring-0 w-full"
                onClick={() => setMode("view")}
              >
                <CgUndo />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-neutral-800 focus:outline-0 hover:ring-0 w-full"
                onClick={() => setMode("view")}
              >
                <MdDone />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-neutral-800 focus:outline-0 hover:ring-0"
              onClick={() => setMode("edit")}
            >
              <FiEdit2 />
            </Button>
          )} */}
        </div>
      </PopoverContent>
    </Popover>
  );
};
