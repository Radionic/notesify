import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { type FinishReason, generateText, streamText } from "ai";
import { db } from "@/db";
import { type ModelUsageType, modelUsagesTable } from "@/db/schema";
import { generateId } from "@/lib/id";
import { getModelById } from "./get-model";
import { truncateMessages } from "./truncate-messages";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type ProviderUsage = {
  inputTokenDetails: {
    noCacheTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
  };
  outputTokenDetails: {
    textTokens?: number;
    reasoningTokens?: number;
  };
  raw?: {
    cost_details?: {
      upstream_inference_cost?: number;
      upstream_inference_prompt_cost?: number;
      upstream_inference_completions_cost?: number;
    };
  };
};

const insertStepsUsage = async ({
  modelId,
  userId,
  chatId,
  messageId,
  pdfId,
  usageType,
  steps,
}: {
  modelId: string;
  userId: string;
  chatId?: string;
  messageId?: string;
  pdfId?: string;
  usageType: ModelUsageType;
  steps: {
    usage: ProviderUsage;
    finishReason: FinishReason;
  }[];
}) => {
  if (steps.length === 0) return;
  await db.insert(modelUsagesTable).values(
    steps.map(({ usage, finishReason }) => ({
      id: generateId(),
      modelId,
      userId,
      chatId,
      messageId,
      pdfId,
      type: usageType,
      inputUncachedTokens: usage.inputTokenDetails.noCacheTokens,
      inputCachedReadTokens: usage.inputTokenDetails.cacheReadTokens,
      inputCachedWriteTokens: usage.inputTokenDetails.cacheWriteTokens,
      outputTextTokens: usage.outputTokenDetails.textTokens,
      outputReasoningTokens: usage.outputTokenDetails.reasoningTokens,
      inputCost:
        usage.raw?.cost_details?.upstream_inference_prompt_cost?.toString(),
      outputCost:
        usage.raw?.cost_details?.upstream_inference_completions_cost?.toString(),
      finishReason,
    })),
  );
};

export const trackedGenerateText = async (
  args: Parameters<typeof generateText>[0] & {
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
    internal?: boolean;
  },
): Promise<Awaited<ReturnType<typeof generateText>>> => {
  const {
    userId,
    pdfId,
    chatId,
    messageId,
    usageType,
    internal,
    prompt,
    messages,
    ...aiArgs
  } = args;

  try {
    const model = await getModelById({
      id: aiArgs.model.toString(),
      internal,
    });

    const truncatedInput = truncateMessages(
      { prompt, messages },
      model.maxInputChars,
    );

    const result = await generateText({
      ...aiArgs,
      ...truncatedInput,
      model: openrouter.chatModel(model.modelId),
      maxOutputTokens: model.maxOutputTokens ?? undefined,
      providerOptions: model.providerOptions,
    } as Parameters<typeof generateText>[0]);
    await insertStepsUsage({
      modelId: model.id,
      userId,
      chatId,
      messageId,
      pdfId,
      usageType,
      steps: result.steps,
    });
    return result;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const trackedStreamText = async (
  args: Parameters<typeof streamText>[0] & {
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
    internal?: boolean;
  },
): Promise<ReturnType<typeof streamText>> => {
  const {
    userId,
    pdfId,
    chatId,
    messageId,
    usageType,
    internal,
    prompt,
    messages,
    onFinish,
    ...aiArgs
  } = args;

  const model = await getModelById({
    id: aiArgs.model.toString(),
    internal,
  });

  const truncatedInput = truncateMessages(
    { prompt, messages },
    model.maxInputChars,
  );

  const result = streamText({
    ...aiArgs,
    ...truncatedInput,
    model: openrouter.chatModel(model.modelId),
    maxOutputTokens: model.maxOutputTokens ?? undefined,
    providerOptions: model.providerOptions,
    onFinish: async (event) => {
      try {
        await onFinish?.(event);
        await insertStepsUsage({
          modelId: model.id,
          userId,
          chatId,
          messageId,
          pdfId,
          usageType,
          steps: event.steps,
        });
      } catch (error) {
        console.error("Error streaming text:", error);
        throw error;
      }
    },
  } as Parameters<typeof streamText>[0]);

  return result;
};
