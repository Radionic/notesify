import { useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

import { activePdfIdAtom, viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { useEffect, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { useUpdatePdf } from "@/queries/pdf/use-pdf";

export const useZoom = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const activePdfId = useAtomValue(activePdfIdAtom);
  const activeViewer = useAtomValue(viewerAtomFamily(activePdfId));
  const { mutate: updatePdfMetadata } = useUpdatePdf();

  const viewer = useAtomValue(viewerAtomFamily(pdfId));

  const isPinching = useRef(false);
  const lastUpdateTime = useRef(0);
  const THROTTLE_DELAY = 16; // 60 fps

  const zoom = ({
    activeTarget,
    steps,
    scaleFactor,
    origin,
  }: {
    activeTarget?: boolean;
    steps?: number;
    scaleFactor?: number;
    origin?: number[];
  }) => {
    // Throttled zoom
    const now = Date.now();
    if (now - lastUpdateTime.current >= THROTTLE_DELAY) {
      if (activeTarget) {
        activeViewer?.updateScale({ steps, scaleFactor, origin });
        updatePdfMetadata({
          pdfId,
          zoom: activeViewer?.currentScale || 1,
        });
      } else {
        viewer?.updateScale({ steps, scaleFactor, origin });
        updatePdfMetadata({
          pdfId,
          zoom: viewer?.currentScale || 1,
        });
      }
      lastUpdateTime.current = now;
    }
  };

  useHotkeys(
    "mod+equal",
    () => zoom({ scaleFactor: 1.25, activeTarget: true }),
    { preventDefault: true },
    [activeViewer]
  );
  useHotkeys(
    "mod+minus",
    () => zoom({ scaleFactor: 1 / 1.25, activeTarget: true }),
    { preventDefault: true },
    [activeViewer]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if ((!e.ctrlKey && !e.metaKey) || !viewer) return;
      e.preventDefault();
      const origin = [e.clientX, e.clientY];
      const scaleFactor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
      zoom({ scaleFactor, origin });
    };

    containerRef.current.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () =>
      containerRef.current?.removeEventListener("wheel", handleWheel);
  }, [viewer, containerRef]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.addEventListener(
      "touchstart",
      (e) => {
        if (isPinching.current) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }, [containerRef]);

  useGesture(
    {
      onPinchStart: () => {
        isPinching.current = true;
      },
      onPinchEnd: () => {
        isPinching.current = false;
      },
      onPinch: ({ movement: [mx, my], origin }) => {
        if (!viewer || mx === 0 || my === 0) return;
        // toast.info(`${mx}, ${my}`);
        zoom({ scaleFactor: mx > 1 ? 1.1 : 1 / 1.1, origin });
      },
    },
    {
      target: containerRef,
    }
  );
};
