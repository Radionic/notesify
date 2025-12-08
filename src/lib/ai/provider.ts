import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const aiProvider = createOpenAICompatible({
  name: "openai-compatible",
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
  includeUsage: false,
  supportsStructuredOutputs: true,
});
