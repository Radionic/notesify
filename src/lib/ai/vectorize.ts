// @ts-ignore
import { env } from "cloudflare:workers";

type EmbeddingResponse = {
  data: {
    embedding: number[];
    index: number;
  }[];
};

const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_API_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("OPENAI_API_KEY or OPENAI_API_BASE_URL is not set");
  }

  const url = `${baseUrl}/embeddings`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL_ID,
      input: texts,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get embeddings: ${response.status} ${body}`);
  }

  const json = (await response.json()) as EmbeddingResponse;
  return json.data.map((item) => item.embedding);
};

const truncateVector = (values: number[]): number[] => {
  // For Matryoshka Embedding models only
  const dim = Number(env.VECTOR_DIMENSION);
  if (!Number.isInteger(dim) || dim <= 0 || values.length <= dim) {
    return values;
  }

  const truncated = values.slice(0, dim);

  let normSq = 0;
  for (const v of truncated) {
    normSq += v * v;
  }
  if (normSq === 0) {
    return truncated;
  }

  const invNorm = 1 / Math.sqrt(normSq);
  return truncated.map((v) => v * invNorm);
};

export type VectorItem = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export const upsertText = async (items: VectorItem[]) => {
  if (!items.length) return;

  const texts = items.map((item) => item.text);
  const embeddings = await getEmbeddings(texts);

  if (embeddings.length !== items.length) {
    throw new Error("Embedding count does not match items count");
  }

  await env.VECTORIZE.upsert(
    items.map((item, index) => ({
      id: item.id,
      values: truncateVector(embeddings[index]),
      metadata: item.metadata,
    })),
  );
};

type QueryTextResult = {
  count: number;
  matches: {
    id: string;
    score: number;
    metadata?: Record<string, unknown>;
  }[];
};

type RerankingResponse = {
  scores: number[];
};

const rerankMatches = async (
  query: string,
  matches: QueryTextResult["matches"],
) => {
  if (!matches.length) {
    return [];
  }

  const response = await fetch(
    `${process.env.RERANK_API_BASE_URL}/v1/inference/${process.env.RERANK_MODEL_ID}` as string,
    {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.RERANK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: [query],
        documents: matches.map((match) => match.metadata?.text),
      }),
    },
  );
  if (!response.ok) {
    return matches.map((match) => ({
      ...match,
      queryScore: match.score,
      rerankScore: null,
    }));
  }

  const json = (await response.json()) as RerankingResponse;
  if (!Array.isArray(json.scores) || json.scores.length !== matches.length) {
    return matches.map((match) => ({
      ...match,
      queryScore: match.score,
      rerankScore: null,
    }));
  }

  return matches
    .map((match, index) => ({
      ...match,
      queryScore: match.score,
      rerankScore: json.scores[index],
    }))
    .sort((a, b) => b.rerankScore - a.rerankScore);
};

export const queryText = async (
  text: string,
  options?: {
    topK?: number;
    filter?: Record<string, unknown>;
    returnMetadata?: "indexed" | "all";
    returnValues?: boolean;
  },
) => {
  const formattedQuery = `Instruct: Given a web search query, retrieve relevant passages that answer the query.\nQuery: ${text}`;
  const [embedding] = await getEmbeddings([formattedQuery]);
  if (!embedding) {
    throw new Error("Failed to generate embedding for query text");
  }
  const result = (await env.VECTORIZE.query(
    truncateVector(embedding),
    options,
  )) as QueryTextResult;
  const rerankedResult = await rerankMatches(text, result.matches);
  return rerankedResult;
};

export const deleteEmbeddingsByIds = async (ids: string[]) => {
  if (!ids.length) return;

  await env.VECTORIZE.deleteByIds(ids);
};
