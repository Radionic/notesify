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
    <div className="flex flex-row gap-1 p-1">
      {/* Sizes */}
      <div className="flex items-center gap-3">
        {sizes.map((size, i) => (
          <div
            key={size}
            className={cn(
              "w-6 h-6 cursor-pointer rounded-md flex items-center justify-center",
              selectedSize === size && "bg-primary"
            )}
            onClick={() => setSize(size)}
          >
            <div
              className="rounded-full bg-black"
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
      <div className="flex items-center gap-3">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => setColor(color)}
            className={cn(
              "w-6 h-6 cursor-pointer p-1 rounded-md",
              selectedColor === color && "bg-primary"
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
