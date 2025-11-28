import { useAtomValue } from "jotai";
import type React from "react";

import { renderedPagesAtomFamily } from "@/atoms/pdf/pdf-viewer";

interface LayersProps {
  children: (pageNumber: number) => React.ReactNode;
  pdfId: string;
}

export const Layers = ({ children, pdfId }: LayersProps) => {
  const pages = useAtomValue(renderedPagesAtomFamily(pdfId));
  return pages.map((pageNumber) => children(pageNumber));
};
