import type { Rect } from "../types";
import { getPagesFromRange } from "./pages";
import { toPercentage } from "./position";

function insideRect(rect1: DOMRect, rect2: DOMRect) {
  // Check if rect1 is inside rect2
  return (
    rect1.top > rect2.top &&
    rect1.bottom < rect2.bottom &&
    rect1.left > rect2.left &&
    rect1.right < rect2.right
  );
}

function shouldMergeRects(rect1: Rect, rect2: Rect): boolean {
  // Must be on the same page
  if (rect1.page !== rect2.page) return false;

  // Calculate overlap area
  const overlapLeft = Math.max(rect1.left, rect2.left);
  const overlapRight = Math.min(rect1.right, rect2.right);
  const overlapTop = Math.max(rect1.top, rect2.top);
  const overlapBottom = Math.min(rect1.bottom, rect2.bottom);

  // If there's no overlap, don't merge
  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
    return false;
  }

  const overlapArea =
    (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  const rect1Area = (rect1.right - rect1.left) * (rect1.bottom - rect1.top);
  const rect2Area = (rect2.right - rect2.left) * (rect2.bottom - rect2.top);
  const smallerArea = Math.min(rect1Area, rect2Area);

  // Only merge if the overlap is significant (more than 50% of the smaller rectangle)
  return overlapArea > smallerArea * 0.5;
}

function mergeRects(rect1: Rect, rect2: Rect): Rect {
  return {
    left: Math.min(rect1.left, rect2.left),
    top: Math.min(rect1.top, rect2.top),
    right: Math.max(rect1.right, rect2.right),
    bottom: Math.max(rect1.bottom, rect2.bottom),
    page: rect1.page,
  };
}

export function getRectsFromRange(
  container: HTMLDivElement,
  range: Range,
): Rect[] {
  const clientRects = Array.from(range.getClientRects());
  const pages = getPagesFromRange(container, range);
  if (!pages) return [];

  const tempRects: Rect[] = [];

  // First, collect all valid rects
  for (const clientRect of clientRects) {
    if (clientRect.width === 0 || clientRect.height === 0) {
      continue;
    }

    for (const page of pages) {
      const pageNumber = page.dataset.pageNumber;
      if (!pageNumber) continue;

      const pageRect = page.getBoundingClientRect();
      if (insideRect(clientRect, pageRect)) {
        // Coordinates relative to the page
        const left = clientRect.left + page.scrollLeft - pageRect.left;
        const top = clientRect.top + page.scrollTop - pageRect.top;
        const right = left + clientRect.width;
        const bottom = top + clientRect.height;

        const rect = toPercentage(container, {
          left,
          top,
          right,
          bottom,
          page: parseInt(pageNumber),
        });
        tempRects.push(rect as Rect);
      }
    }
  }

  // Sort rectangles by position to ensure consistent merging
  // tempRects.sort((a, b) => {
  //   if (a.page !== b.page) return a.page - b.page;
  //   if (a.top !== b.top) return a.top - b.top;
  //   return a.left - b.left;
  // });

  // Merge overlapping rectangles
  const mergedRects: Rect[] = [];
  for (const rect of tempRects) {
    let merged = false;
    for (let i = 0; i < mergedRects.length; i++) {
      if (shouldMergeRects(rect, mergedRects[i])) {
        mergedRects[i] = mergeRects(rect, mergedRects[i]);
        merged = true;
        break;
      }
    }
    if (!merged) {
      mergedRects.push(rect);
    }
  }

  return mergedRects;
}

export const calcBoundingRect = (rects: Rect[]) => {
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  rects.forEach((rect) => {
    minLeft = Math.min(minLeft, rect.left);
    minTop = Math.min(minTop, rect.top);
    maxRight = Math.max(maxRight, rect.right);
    maxBottom = Math.max(maxBottom, rect.bottom);
  });

  return {
    left: minLeft,
    top: minTop,
    right: maxRight,
    bottom: maxBottom,
    page: rects[0].page,
  };
};
