import { distance as levenshtein } from "fastest-levenshtein";
import type { Rect } from "@/lib/types";

export type BBox = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  start: number;
  end: number;
};

export const findClosestMatch = (
  text: string,
  query: string,
): {
  match: string;
  startIndex: number;
} => {
  const n = text.length;
  const m = query.length;

  if (!m) return { match: "", startIndex: 0 };
  if (!n) return { match: "", startIndex: -1 };

  const exactPos = text.indexOf(query);
  if (exactPos !== -1) {
    return { match: query, startIndex: exactPos };
  }

  const matchScore = 2;
  const mismatchPenalty = 1;
  const gapPenalty = 1;

  let prevRow = new Array(m + 1).fill(0);
  let currRow = new Array(m + 1).fill(0);

  let maxScore = 0;
  let maxI = 0;
  let maxJ = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const isMatch = text[i - 1] === query[j - 1];
      const diagScore =
        prevRow[j - 1] + (isMatch ? matchScore : -mismatchPenalty);
      const upScore = prevRow[j] - gapPenalty;
      const leftScore = currRow[j - 1] - gapPenalty;

      currRow[j] = Math.max(0, diagScore, upScore, leftScore);

      if (currRow[j] > maxScore) {
        maxScore = currRow[j];
        maxI = i;
        maxJ = j;
      }
    }

    [prevRow, currRow] = [currRow, prevRow];
    currRow.fill(0);
  }

  if (maxScore === 0) {
    return { match: "", startIndex: -1 };
  }

  const H: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const isMatch = text[i - 1] === query[j - 1];
      const diagScore =
        H[i - 1][j - 1] + (isMatch ? matchScore : -mismatchPenalty);
      const upScore = H[i - 1][j] - gapPenalty;
      const leftScore = H[i][j - 1] - gapPenalty;
      H[i][j] = Math.max(0, diagScore, upScore, leftScore);
    }
  }

  let i = maxI;
  let j = maxJ;
  let startI = maxI;

  while (i > 0 && j > 0 && H[i][j] > 0) {
    const current = H[i][j];
    const isMatch = text[i - 1] === query[j - 1];
    const diagScore =
      H[i - 1][j - 1] + (isMatch ? matchScore : -mismatchPenalty);

    if (current === diagScore) {
      startI = i - 1;
      i--;
      j--;
    } else if (current === H[i - 1][j] - gapPenalty) {
      startI = i - 1;
      i--;
    } else {
      j--;
    }
  }

  const matchedText = text.substring(startI, maxI);
  return {
    match: matchedText,
    startIndex: startI,
  };
};

export const overlapRectsForMatch = ({
  bboxes,
  page,
  startIndex,
  matchLength,
}: {
  bboxes: BBox[];
  page: number;
  startIndex: number;
  matchLength: number;
}): Rect[] => {
  if (!bboxes.length || startIndex < 0 || matchLength <= 0) return [];
  const matchEnd = startIndex + matchLength;

  return bboxes
    .filter((b) => b.end > startIndex && b.start < matchEnd)
    .map((b) => {
      const boxLength = b.end - b.start;
      if (boxLength <= 0) {
        return {
          page,
          top: b.top,
          left: b.left,
          right: b.right,
          bottom: b.bottom,
        };
      }

      const intersectStart = Math.max(startIndex, b.start);
      const intersectEnd = Math.min(matchEnd, b.end);

      const startRatio = (intersectStart - b.start) / boxLength;
      const endRatio = (intersectEnd - b.start) / boxLength;

      const boxWidth = b.right - b.left;

      return {
        page,
        top: b.top,
        left: b.left + boxWidth * startRatio,
        right: b.left + boxWidth * endRatio,
        bottom: b.bottom,
      };
    });
};

export const searchInPage = ({
  text,
  bboxes,
  query,
  page,
}: {
  text: string;
  bboxes: BBox[];
  query: string;
  page: number;
}): Rect[] => {
  const { match, startIndex } = findClosestMatch(text, query);
  const distance = levenshtein(match, query);

  if (
    startIndex >= 0 &&
    match.length > 0 &&
    distance < query.length * 0.1 // 10% tolerance
  ) {
    return overlapRectsForMatch({
      bboxes,
      page,
      startIndex,
      matchLength: match.length,
    });
  }

  return [];
};
