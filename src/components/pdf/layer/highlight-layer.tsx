import { useHighlightsByPage } from "@/queries/pdf/use-highlight";
import { Highlight } from "./components/highlight";

export const HighlightLayer = ({
  pdfId,
  pageNumber,
  disabled,
}: {
  pdfId: string;
  pageNumber: number;
  disabled?: boolean;
}) => {
  const highlightsByPage = useHighlightsByPage({ pdfId });
  const highlights = highlightsByPage?.[pageNumber] || [];
  return highlights.map((highlight: any) => (
    <Highlight key={highlight.id} highlight={highlight} disabled={disabled} />
  ));
};
