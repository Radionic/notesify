import type { RefObject } from "react";
import { useEffect, useState } from "react";

export const useElementWidth = (ref: RefObject<HTMLElement | null>): number => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextWidth = entry?.contentRect?.width ?? 0;
      setWidth(nextWidth);
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [ref]);

  return width;
};
