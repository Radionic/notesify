import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { pdfIndexingTable } from "@/db/schema";

const SNIPPET_CHARS = 200;

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
}): Promise<SearchKeywordsResultItem[]> => {
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

  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  const results = items
    .map(({ page, content }) => {
      const lowerContent = content.toLowerCase();
      const sentences: string[] = [];

      for (const kw of lowerKeywords) {
        let fromIndex = 0;

        while (true) {
          const idx = lowerContent.indexOf(kw, fromIndex);
          if (idx === -1) break;

          const half = Math.max(0, Math.floor((SNIPPET_CHARS - kw.length) / 2));
          let start = Math.max(0, idx - half);
          let end = Math.min(content.length, idx + kw.length + half);

          if (end - start > SNIPPET_CHARS) {
            end = start + SNIPPET_CHARS;
          }
          if (end === content.length && end - start < SNIPPET_CHARS) {
            start = Math.max(0, end - SNIPPET_CHARS);
          }

          const snippet = content.slice(start, end).trim();
          if (snippet && !sentences.includes(snippet)) {
            sentences.push(snippet);
          }

          fromIndex = idx + kw.length;
        }
      }

      if (sentences.length === 0) return null;

      return { page, sentences };
    })
    .filter(
      (
        item,
      ): item is {
        page: number;
        sentences: string[];
      } => item !== null,
    );

  return results;
};
