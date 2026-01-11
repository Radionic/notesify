import { generateText, type JSONValue, streamText } from "ai";
import { db } from "@/db";
import { type ModelUsageType, modelUsagesTable } from "@/db/schema";
import { generateId } from "@/lib/id";
import { getModelById } from "./get-model";
import { truncateMessages } from "./truncate-messages";

type GatewayMetadata = {
  cost?: string;
  routing?: {
    finalProvider?: string;
  };
};

type ProviderOptions = Record<string, Record<string, JSONValue>>;

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
      model: model.modelId,
      maxOutputTokens: model.maxOutputTokens ?? undefined,
      providerOptions: model.providerOptions as ProviderOptions,
    } as Parameters<typeof generateText>[0]);
    const gateway = result.providerMetadata?.gateway as GatewayMetadata;
    await db.insert(modelUsagesTable).values({
      id: generateId(),
      modelId: model.id,
      userId,
      chatId,
      messageId,
      pdfId,
      type: usageType,
      inputUncachedTokens: result.totalUsage?.inputTokenDetails.noCacheTokens,
      inputCachedReadTokens:
        result.totalUsage?.inputTokenDetails.cacheReadTokens,
      inputCachedWriteTokens:
        result.totalUsage?.inputTokenDetails.cacheWriteTokens,
      outputTextTokens: result.totalUsage?.outputTokenDetails.textTokens,
      outputReasoningTokens:
        result.totalUsage?.outputTokenDetails.reasoningTokens,
      finishReason: result.finishReason,
      cost: gateway?.cost,
      provider: gateway?.routing?.finalProvider,
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
    model: model.modelId,
    maxOutputTokens: model.maxOutputTokens ?? undefined,
    providerOptions: model.providerOptions as ProviderOptions,
    onFinish: async (event) => {
      try {
        await onFinish?.(event);
        const gateway = event.providerMetadata?.gateway as GatewayMetadata;
        await db.insert(modelUsagesTable).values({
          id: generateId(),
          modelId: model.id,
          userId,
          chatId,
          messageId,
          pdfId,
          type: usageType,
          inputUncachedTokens:
            event.totalUsage?.inputTokenDetails.noCacheTokens,
          inputCachedReadTokens:
            event.totalUsage?.inputTokenDetails.cacheReadTokens,
          inputCachedWriteTokens:
            event.totalUsage?.inputTokenDetails.cacheWriteTokens,
          outputTextTokens: event.totalUsage?.outputTokenDetails.textTokens,
          outputReasoningTokens:
            event.totalUsage?.outputTokenDetails.reasoningTokens,
          finishReason: event.finishReason,
          cost: gateway?.cost,
          provider: gateway?.routing?.finalProvider,
        });
      } catch (error) {
        console.error("Error streaming text:", error);
        throw error;
      }
    },
  } as Parameters<typeof streamText>[0]);

  return result;
};
