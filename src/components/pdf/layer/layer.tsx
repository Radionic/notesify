import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import type React from "react";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";

export const Layer = ({
  pdfId,
  pageNumber,
  children,
}: {
  pdfId: string;
  pageNumber: number;
  children: React.ReactNode;
}) => {
  // const overlaySize = useLayer(pdfId, pageNumber);
  // if (!overlaySize) return null;
  // return (
  //   <div style={overlaySize} className="absolute pointer-events-none">
  //     {children}
  //   </div>
  // );
  const queryClient = useQueryClient();
  const myLayer = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const viewer = useAtomValue(viewerAtomFamily(pdfId));

  // Setup effect
  useEffect(() => {
    if (!myLayer.current || !myLayer.current.isConnected) {
      const pageLayer = viewer?.getPageView(pageNumber - 1)?.div;
      if (!pageLayer) {
        console.error("Could not find page layer");
        return;
      }

      const newLayer = document.createElement("div");
      pageLayer.appendChild(newLayer);
      myLayer.current = newLayer;

      const root = createRoot(newLayer);
      rootRef.current = root;

      root.render(
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>,
      );
    }
  }, [children, viewer]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Use setTimeout to defer the unmounting to the next tick
      // to avoid "Attempted to synchronously unmount a root while React was already rendering"
      setTimeout(() => {
        // We need to unmount the root in order to unmount
        // components outside of myLayer (e.g. Popover created by portals)
        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }
        if (myLayer.current) {
          myLayer.current.remove();
          myLayer.current = null;
        }
      }, 0);
    };
  }, []);

  return null;
};
