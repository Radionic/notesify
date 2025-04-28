import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import {
  penSizes,
  penColors,
  highlighterSizes,
  highlighterColors,
  selectedPenSizeAtomFamily,
  selectedHighlighterSizeAtomFamily,
  selectedPenColorAtomFamily,
  selectedHighlighterColorAtomFamily,
} from "@/atoms/pdf/annotator-options";
import { Separator } from "@/components/ui/separator";

export const AnnotatorOptions = ({
  pdfId,
  type,
}: {
  pdfId: string;
  type: string;
}) => {
  const isPen = type === "pen";
  const [selectedSize, setSize] = useAtom(
    isPen
      ? selectedPenSizeAtomFamily(pdfId)
      : selectedHighlighterSizeAtomFamily(pdfId)
  );
  const [selectedColor, setColor] = useAtom(
    isPen
      ? selectedPenColorAtomFamily(pdfId)
      : selectedHighlighterColorAtomFamily(pdfId)
  );

  const sizes = isPen ? penSizes : highlighterSizes;
  const colors = isPen ? penColors : highlighterColors;

  return (
    <div className="flex flex-row items-center gap-1 p-1">
      {/* Sizes */}
      <div className="flex items-center gap-1">
        {sizes.map((size, i) => (
          <div
            key={size}
            className={cn(
              "size-8 cursor-pointer rounded-md flex items-center justify-center",
              selectedSize === size && "bg-secondary"
            )}
            onClick={() => setSize(size)}
          >
            <div
              className="rounded-full bg-primary"
              style={{
                width: `${i * 0.2 + 0.4}rem`,
                height: `${i * 0.2 + 0.4}rem`,
              }}
            />
          </div>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => setColor(color)}
            className={cn(
              "size-8 cursor-pointer p-2 rounded-md",
              selectedColor === color && "bg-secondary"
            )}
          >
            <div
              className="rounded-full w-full h-full"
              style={{
                backgroundColor: color,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
