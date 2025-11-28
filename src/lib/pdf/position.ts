import type { PagedPosition, Position, Rect } from "../types";

export const calculatePosition = (
  anchor?: Rect,
  placement?: "top-center" | "bottom-end",
): PagedPosition | undefined => {
  if (!anchor) return;

  if (placement === "top-center") {
    const bottom = 1 - anchor.top;
    const left = (anchor.left + anchor.right) / 2;
    return { left, bottom, page: anchor.page };
  } else if (placement === "bottom-end") {
    const top = anchor.bottom;
    const left = anchor.right;
    return { left, top, page: anchor.page };
  } else {
    console.error("Unsupported placement", placement);
  }
};

export const toPercentage = (
  container: HTMLDivElement,
  rect: Rect | PagedPosition,
): Rect | Position => {
  const pageEl = container.querySelector(
    `.page[data-page-number="${rect.page}"]`,
  );
  if (!pageEl) return rect;

  const pageRect = pageEl.getBoundingClientRect();
  return {
    ...rect,
    top: rect.top ? rect.top / pageRect.height : undefined,
    right: rect.right ? rect.right / pageRect.width : undefined,
    bottom: rect.bottom ? rect.bottom / pageRect.height : undefined,
    left: rect.left ? rect.left / pageRect.width : undefined,
  };
};

export const toPercentageString = (value?: number, padding: number = 0) => {
  return value ? `calc(${value * 100}% + ${padding}px)` : undefined;
};

export const toPercentageStyle = (
  rect: Rect | PagedPosition,
  padding: number = 0,
) => {
  const width = rect.right && rect.left ? rect.right - rect.left : undefined;
  const height = rect.bottom && rect.top ? rect.bottom - rect.top : undefined;
  return {
    top: toPercentageString(rect.top, -padding),
    right: toPercentageString(rect.right, padding),
    bottom: toPercentageString(rect.bottom, padding),
    left: toPercentageString(rect.left, -padding),
    width: toPercentageString(width, padding * 2),
    height: toPercentageString(height, padding * 2),
  };
};
