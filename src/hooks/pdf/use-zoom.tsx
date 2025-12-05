import { useGesture } from "@use-gesture/react";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDebounceCallback } from "usehooks-ts";
import { activePdfIdAtom, viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { useUpdatePdf } from "@/queries/pdf/use-pdf";

export const useZoom = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const activePdfId = useAtomValue(activePdfIdAtom);
  const activeViewer = useAtomValue(viewerAtomFamily(activePdfId));
  const viewer = useAtomValue(viewerAtomFamily(pdfId));

  const { mutate: updatePdfMetadata } = useUpdatePdf();
  const debouncedUpdateZoom = useDebounceCallback(updatePdfMetadata, 500);

  // To prevent zooming during inertial scrolling
  const wheelStateRef = useRef({
    lastEventTime: 0,
    startedWithModifier: false,
  });
  const isPinching = useRef(false);
  const pinchLastScale = useRef(1);

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
    if (activeTarget) {
      activeViewer?.updateScale({ steps, scaleFactor, origin });
      debouncedUpdateZoom({
        pdfId,
        zoom: activeViewer?.currentScale || 1,
      });
    } else {
      viewer?.updateScale({ steps, scaleFactor, origin });
      debouncedUpdateZoom({
        pdfId,
        zoom: viewer?.currentScale || 1,
      });
    }
  };

  useHotkeys(
    "mod+equal",
    () => zoom({ scaleFactor: 1.25, activeTarget: true }),
    { preventDefault: true },
    [activeViewer, pdfId],
  );
  useHotkeys(
    "mod+minus",
    () => zoom({ scaleFactor: 1 / 1.25, activeTarget: true }),
    { preventDefault: true },
    [activeViewer, pdfId],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      // To prevent zooming during inertial scrolling
      const now = Date.now();
      const timeSinceLast = now - wheelStateRef.current.lastEventTime;
      if (timeSinceLast > 250) {
        wheelStateRef.current.startedWithModifier = e.ctrlKey || e.metaKey;
      }
      wheelStateRef.current.lastEventTime = now;

      if (!wheelStateRef.current.startedWithModifier || !viewer) return;
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
  }, [viewer, pdfId, containerRef]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.addEventListener(
      "touchstart",
      (e) => {
        if (isPinching.current) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  }, [containerRef]);

  useGesture(
    {
      onPinchStart: ({ movement: [scale] }) => {
        isPinching.current = true;
        pinchLastScale.current = scale || 1;
      },
      onPinchEnd: () => {
        isPinching.current = false;
        pinchLastScale.current = 1;
      },
      onPinch: ({ movement: [scale], origin }) => {
        if (!viewer) return;

        const lastScale = pinchLastScale.current || 1;
        const scaleFactor = scale && lastScale ? scale / lastScale : 1;

        if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) return;
        if (Math.abs(scaleFactor - 1) < 0.01) return;

        pinchLastScale.current = scale || 1;
        zoom({ scaleFactor, origin });
      },
    },
    {
      target: containerRef,
    },
  );
};
