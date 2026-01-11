import { generateObject, generateText, type JSONValue, streamText } from "ai";
import type { infer as ZodInfer, ZodTypeAny } from "zod";
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
      promptTokens: result.totalUsage?.inputTokens,
      cachedInputTokens: result.totalUsage?.cachedInputTokens,
      completionTokens: result.totalUsage?.outputTokens,
      reasoningTokens: result.totalUsage?.reasoningTokens,
      totalTokens: result.totalUsage?.totalTokens,
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

export function trackedGenerateObject<S extends ZodTypeAny>(
  args: Parameters<typeof generateObject>[0] & {
    schema: S;
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
    internal?: boolean;
  },
): Promise<
  Omit<Awaited<ReturnType<typeof generateObject>>, "object"> & {
    object: ZodInfer<S>;
  }
>;

export async function trackedGenerateObject(
  args: Parameters<typeof generateObject>[0] & {
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
    internal?: boolean;
  },
): Promise<Awaited<ReturnType<typeof generateObject>>> {
  const { userId, pdfId, chatId, messageId, usageType, internal, ...aiArgs } =
    args;

  try {
    const model = await getModelById({
      id: aiArgs.model.toString(),
      internal,
    });
    const result = await generateObject({
      ...aiArgs,
      model: model.modelId,
      maxOutputTokens: model.maxOutputTokens ?? undefined,
      providerOptions: model.providerOptions as ProviderOptions,
    });
    const gateway = result.providerMetadata?.gateway as GatewayMetadata;
    await db.insert(modelUsagesTable).values({
      id: generateId(),
      modelId: model.id,
      userId,
      chatId,
      messageId,
      pdfId,
      type: usageType,
      promptTokens: result.usage?.inputTokens,
      cachedInputTokens: result.usage?.cachedInputTokens,
      completionTokens: result.usage?.outputTokens,
      reasoningTokens: result.usage?.reasoningTokens,
      totalTokens: result.usage?.totalTokens,
      finishReason: result.finishReason,
      cost: gateway?.cost,
      provider: gateway?.routing?.finalProvider,
    });
    return result;
  } catch (error) {
    console.error("Error generating object:", error);
    throw error;
  }
}

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
          promptTokens: event.totalUsage?.inputTokens,
          cachedInputTokens: event.totalUsage?.cachedInputTokens,
          completionTokens: event.totalUsage?.outputTokens,
          reasoningTokens: event.totalUsage?.reasoningTokens,
          totalTokens: event.totalUsage?.totalTokens,
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
