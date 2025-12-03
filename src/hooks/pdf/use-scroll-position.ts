import { useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useUpdatePdf } from "@/queries/pdf/use-pdf";

export const useScrollPosition = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const { mutate: setScrollPositions } = useUpdatePdf();
  const saveScrollPosition = useDebounceCallback(setScrollPositions, 500);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      saveScrollPosition({
        pdfId,
        scroll: {
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop,
        },
      });
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, pdfId, saveScrollPosition]);
};
