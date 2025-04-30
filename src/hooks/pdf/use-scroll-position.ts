import { useUpdatePdf } from "@/queries/pdf/use-pdf";
import { useEffect } from "react";

export const useScrollPosition = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const { mutate: setScrollPositions } = useUpdatePdf();

  // Save scroll position when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      setScrollPositions({
        pdfId,
        scroll: {
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop,
        },
      });
    };

    containerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      containerRef.current?.removeEventListener("scroll", handleScroll);
  }, [pdfId, containerRef, setScrollPositions]);
};
