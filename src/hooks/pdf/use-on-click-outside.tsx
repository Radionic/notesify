import { type RefObject, useEffect } from "react";

type UseClickOutsideMethod = "contains" | "coordinates";

export function useOnClickOutside<T extends HTMLElement>(
  refs: RefObject<T>[] | RefObject<T>,
  handler?: (event: PointerEvent) => void,
  method: UseClickOutsideMethod = "contains",
) {
  useEffect(() => {
    function isPointInRect(x: number, y: number, element: HTMLElement) {
      const rect = element.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }

    function handleClickOutside(event: PointerEvent) {
      const refsArray = Array.isArray(refs) ? refs : [refs];

      let isOutside: boolean;

      if (method === "coordinates") {
        const x = event.clientX;
        const y = event.clientY;
        isOutside = refsArray.every(
          (ref) => !ref.current || !isPointInRect(x, y, ref.current),
        );
      } else {
        isOutside = refsArray.every(
          (ref) => ref.current && !ref.current.contains(event.target as Node),
        );
      }

      if (isOutside) {
        handler?.(event);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [refs, handler, method]);
}
