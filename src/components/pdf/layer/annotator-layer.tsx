import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  activeAnnotatorAtomFamily,
  selectedHighlighterColorAtomFamily,
  selectedHighlighterSizeAtomFamily,
  selectedPenColorAtomFamily,
  selectedPenSizeAtomFamily,
} from "@/atoms/pdf/annotator-options";
import { cn } from "@/lib/utils";
import {
  useAnnotationsByPage,
  useCreateAnnotation,
  useRemoveAnnotations,
} from "@/queries/pdf/use-annotation";

export const AnnotatorLayer = ({
  pdfId,
  pageNumber,
}: {
  pdfId: string;
  pageNumber: number;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const annotationsByPage = useAnnotationsByPage({ pdfId });
  const { mutateAsync: createAnnotation } = useCreateAnnotation();
  const { mutateAsync: removeAnnotations } = useRemoveAnnotations();

  const annotator = useAtomValue(activeAnnotatorAtomFamily(pdfId));
  const penSize = useAtomValue(selectedPenSizeAtomFamily(pdfId));
  const penColor = useAtomValue(selectedPenColorAtomFamily(pdfId));
  const highlighterSize = useAtomValue(
    selectedHighlighterSizeAtomFamily(pdfId)
  );
  const highlighterColor = useAtomValue(
    selectedHighlighterColorAtomFamily(pdfId)
  );

  const [currentPath, setCurrentPath] = useState<string>("");
  const [erasingPaths, setErasingPaths] = useState<Set<string>>(new Set());

  const eraserSize = 20;
  const isDrawing = useRef(false);

  useEffect(() => {
    document.addEventListener(
      "touchstart",
      (e) => {
        if (isDrawing.current) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }, []);

  const getActiveToolSize = () => {
    switch (annotator) {
      case "pen":
        return penSize;
      case "highlighter":
        return highlighterSize;
      default:
        return penSize;
    }
  };

  const getActiveToolColor = () => {
    switch (annotator) {
      case "pen":
        return penColor;
      case "highlighter":
        return highlighterColor;
      default:
        return penColor;
    }
  };

  const convertToViewBoxCoordinates = (offsetX: number, offsetY: number) => {
    if (!svgRef.current) {
      return { x: 0, y: 0 };
    }

    const bbox = svgRef.current.getBoundingClientRect();
    return {
      x: offsetX / bbox.width,
      y: offsetY / bbox.height,
    };
  };

  const startDrawing = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;

    isDrawing.current = true;
    if (annotator === "pen" || annotator === "highlighter") {
      const { offsetX, offsetY } = e.nativeEvent;
      const { x, y } = convertToViewBoxCoordinates(offsetX, offsetY);
      setCurrentPath(`M ${x} ${y}`);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !pdfId) return;
    isDrawing.current = false;
    if (annotator === "pen" || annotator === "highlighter") {
      createAnnotation({
        pdfId,
        type: annotator,
        page: pageNumber,
        path: currentPath,
        color: getActiveToolColor(),
        size: getActiveToolSize(),
      });
      setCurrentPath("");
    } else if (annotator === "eraser") {
      removeAnnotations({ pdfId, ids: Array.from(erasingPaths) });
      setErasingPaths(new Set());
    }
  };

  const draw = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg || !isDrawing.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const { x, y } = convertToViewBoxCoordinates(offsetX, offsetY);

    if (annotator === "pen" || annotator === "highlighter") {
      setCurrentPath((prev) => `${prev} L ${x} ${y}`);
    } else if (annotator === "eraser") {
      const bbox = svg.getBoundingClientRect();
      const scaledEraserSize = eraserSize / Math.max(bbox.width, bbox.height);

      const newErasingPaths = new Set(erasingPaths);
      pathRefs.current.forEach((pathRef, index) => {
        const annotation = annotationsByPage[pageNumber][index];
        if (pathRef && shouldErasePath(pathRef, x, y, scaledEraserSize)) {
          newErasingPaths.add(annotation.id);
        }
      });
      setErasingPaths(newErasingPaths);
    }
  };

  const shouldErasePath = (
    pathRef: SVGPathElement,
    eraserX: number,
    eraserY: number,
    scaledEraserSize: number
  ): boolean => {
    const pathLength = pathRef.getTotalLength();
    const numSamples = Math.max(Math.ceil(pathLength / 0.01), 1);

    for (let i = 0; i <= numSamples; i++) {
      const sampleLength = (i / numSamples) * pathLength;
      const samplePoint = pathRef.getPointAtLength(sampleLength);
      const dx = samplePoint.x - eraserX;
      const dy = samplePoint.y - eraserY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= scaledEraserSize) {
        return true;
      }
    }
    return false;
  };

  return (
    <svg
      ref={svgRef}
      className={cn(
        "w-full h-full absolute inset-0 z-[50]",
        annotator ? "pointer-events-auto" : "pointer-events-none"
      )}
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
    >
      {annotationsByPage[pageNumber]?.map((ann, index) => (
        <path
          key={index}
          ref={(el) => {
            pathRefs.current[index] = el;
          }}
          d={ann.path}
          stroke={ann.color}
          strokeWidth={`${ann.size / 100}`}
          fill="none"
          strokeLinecap={ann.type === "highlighter" ? "square" : "round"}
          strokeLinejoin={ann.type === "highlighter" ? "miter" : "round"}
          strokeOpacity={ann.type === "highlighter" ? 0.5 : 1}
          opacity={erasingPaths.has(ann.id) ? 0.5 : 1}
        />
      ))}
      {(annotator === "pen" || annotator === "highlighter") && currentPath && (
        <path
          d={currentPath}
          stroke={getActiveToolColor()}
          strokeWidth={`${getActiveToolSize() / 100}`}
          fill="none"
          strokeLinecap={annotator === "highlighter" ? "square" : "round"}
          strokeLinejoin={annotator === "highlighter" ? "miter" : "round"}
          strokeOpacity={annotator === "highlighter" ? 0.5 : 1}
        />
      )}
    </svg>
  );
};
