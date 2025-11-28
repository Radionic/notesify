import { Badge, type BadgeProps } from "@/components/badge";
import { cn } from "@/lib/utils";

/**
 * Formats an array of page numbers into a condensed representation.
 * Example: [1,2,3,5,8,10,11,12] becomes ["1-3", "5", "8", "10-12"]
 */
const formatPageRanges = (pages: number[]): string[] => {
  if (!pages || pages.length === 0) return [];

  // Sort pages to ensure proper ordering
  const sortedPages = [...pages].sort((a, b) => a - b);

  const ranges: string[] = [];
  let rangeStart = sortedPages[0];
  let rangeEnd = sortedPages[0];

  for (let i = 1; i < sortedPages.length; i++) {
    if (sortedPages[i] === rangeEnd + 1) {
      // Continue the current range
      rangeEnd = sortedPages[i];
    } else {
      // End the current range and start a new one
      if (rangeStart === rangeEnd) {
        ranges.push(`${rangeStart}`);
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = sortedPages[i];
      rangeEnd = sortedPages[i];
    }
  }

  // Add the last range
  if (rangeStart === rangeEnd) {
    ranges.push(`${rangeStart}`);
  } else {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  }

  return ranges;
};

export function PageBadges({
  pages,
  variant = "blue",
  className,
  onClick,
}: {
  pages: number[];
  variant?: BadgeProps["variant"];
  className?: string;
  onClick?: (startPage: number) => void;
}) {
  if (!pages || pages.length === 0) {
    return null;
  }

  const ranges = formatPageRanges(pages);
  return ranges.map((range) => {
    const text = range.includes("-") ? `Pages ${range}` : `Page ${range}`;
    return (
      <Badge
        className={cn("cursor-pointer", className)}
        variant={variant}
        onClick={() => {
          const startPage = Number(range.split("-")[0]);
          onClick?.(startPage);
        }}
      >
        {text}
      </Badge>
    );
  });
}
