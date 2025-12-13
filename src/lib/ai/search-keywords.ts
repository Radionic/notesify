import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { pdfIndexingTable, pdfsTable } from "@/db/schema";

const SNIPPET_CHARS = 200;
const MERGE_DISTANCE = 200; // Merge keywords if they are within this distance

export type SearchKeywordsResultItem = {
  page: number;
  sentences: string[];
};

export const searchKeywords = async ({
  pdfId,
  keywords,
}: {
  pdfId: string;
  keywords: string[];
}): Promise<SearchKeywordsResultItem[] | string> => {
  const items = await db
    .select({
      content: pdfIndexingTable.content,
      page: pdfIndexingTable.startPage,
    })
    .from(pdfIndexingTable)
    .where(
      and(
        eq(pdfIndexingTable.pdfId, pdfId),
        eq(pdfIndexingTable.type, "page"),
        or(
          ...keywords.map((keyword) =>
            ilike(pdfIndexingTable.content, `%${keyword}%`),
          ),
        ),
      ),
    )
    .orderBy(asc(pdfIndexingTable.startPage));

  if (items.length === 0) {
    const pdf = await db.query.pdfsTable.findFirst({
      columns: { id: true },
      where: eq(pdfsTable.id, pdfId),
    });
    if (!pdf) {
      throw Error("pdf not found, check if pdf id is correct");
    }
    return "No results found";
  }

  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  const results = items
    .map(({ page, content }) => {
      if (!page) return null;

      const lowerContent = content.toLowerCase();

      // Find all keyword occurrences with their positions
      const occurrences: { idx: number; length: number }[] = [];
      for (const kw of lowerKeywords) {
        let fromIndex = 0;
        while (true) {
          const idx = lowerContent.indexOf(kw, fromIndex);
          if (idx === -1) break;
          occurrences.push({ idx, length: kw.length });
          fromIndex = idx + kw.length;
        }
      }

      if (occurrences.length === 0) return null;

      // Sort by position
      occurrences.sort((a, b) => a.idx - b.idx);

      // Group nearby occurrences
      const groups: { idx: number; length: number }[][] = [];
      let currentGroup: { idx: number; length: number }[] = [occurrences[0]];

      for (let i = 1; i < occurrences.length; i++) {
        const prev = currentGroup[currentGroup.length - 1];
        const curr = occurrences[i];
        const distance = curr.idx - (prev.idx + prev.length);

        if (distance <= MERGE_DISTANCE) {
          currentGroup.push(curr);
        } else {
          groups.push(currentGroup);
          currentGroup = [curr];
        }
      }
      groups.push(currentGroup);

      // Create snippets from groups
      const half = SNIPPET_CHARS / 2;
      const sentences: string[] = [];

      for (const group of groups) {
        const firstOcc = group[0];
        const lastOcc = group[group.length - 1];

        const start = Math.max(0, firstOcc.idx - half);
        const end = Math.min(
          content.length,
          lastOcc.idx + lastOcc.length + half,
        );

        const snippet = content.slice(start, end).trim();
        if (snippet && !sentences.includes(snippet)) {
          sentences.push(snippet);
        }
      }

      if (sentences.length === 0) return null;

      return { page, sentences };
    })
    .filter((item) => item !== null);

  return results;
};
