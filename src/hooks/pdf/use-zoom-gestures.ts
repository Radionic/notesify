import { useGesture } from "@use-gesture/react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type ZoomFunction = (params: {
  scaleFactor: number;
  origin?: number[];
}) => void;

export const useZoomGestures = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  onZoom: ZoomFunction,
  options?: {
    enableHotkeys?: boolean;
    wheelZoomFactor?: number;
  },
) => {
  const { enableHotkeys = false, wheelZoomFactor = 1.1 } = options || {};

  // To prevent zooming during inertial scrolling
  const wheelStateRef = useRef({
    lastEventTime: 0,
    startedWithModifier: false,
  });
  const isPinching = useRef(false);
  const pinchLastScale = useRef(1);

  useHotkeys(
    "mod+equal",
    () => onZoom({ scaleFactor: 1.25 }),
    { preventDefault: true, enabled: enableHotkeys },
    [onZoom],
  );
  useHotkeys(
    "mod+minus",
    () => onZoom({ scaleFactor: 1 / 1.25 }),
    { preventDefault: true, enabled: enableHotkeys },
    [onZoom],
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

      if (!wheelStateRef.current.startedWithModifier) return;
      e.preventDefault();
      const origin = [e.clientX, e.clientY];
      const scaleFactor = e.deltaY < 0 ? wheelZoomFactor : 1 / wheelZoomFactor;
      onZoom({ scaleFactor, origin });
    };

    const container = containerRef.current;
    container.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => container?.removeEventListener("wheel", handleWheel);
  }, [onZoom, containerRef, wheelZoomFactor]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const handleTouchStart = (e: TouchEvent) => {
      if (isPinching.current) {
        e.preventDefault();
      }
    };
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    return () => container?.removeEventListener("touchstart", handleTouchStart);
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
        const lastScale = pinchLastScale.current || 1;
        const scaleFactor = scale && lastScale ? scale / lastScale : 1;

        if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) return;
        if (Math.abs(scaleFactor - 1) < 0.01) return;

        pinchLastScale.current = scale || 1;
        onZoom({ scaleFactor, origin });
      },
    },
    {
      target: containerRef,
    },
  );
};
