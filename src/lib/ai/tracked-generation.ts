import { generateObject, generateText, streamText } from "ai";
import type { infer as ZodInfer, ZodTypeAny } from "zod";
import { db } from "@/db";
import { type ModelUsageType, modelUsagesTable } from "@/db/schema";
import { generateId } from "@/lib/id";

type GatewayMetadata = {
  cost?: string;
  routing?: {
    finalProvider?: string;
  };
};

export const trackedGenerateText = async (
  args: Parameters<typeof generateText>[0] & {
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
  },
): Promise<Awaited<ReturnType<typeof generateText>>> => {
  const { userId, pdfId, chatId, messageId, usageType, ...aiArgs } = args;

  try {
    const result = await generateText(aiArgs);
    const gateway = result.providerMetadata?.gateway as GatewayMetadata;
    await db.insert(modelUsagesTable).values({
      id: generateId(),
      modelId: aiArgs.model.toString(),
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
  },
): Promise<Awaited<ReturnType<typeof generateObject>>> {
  const { userId, pdfId, chatId, messageId, usageType, ...aiArgs } = args;

  try {
    const result = await generateObject(
      aiArgs as Parameters<typeof generateObject>[0],
    );
    const gateway = result.providerMetadata?.gateway as GatewayMetadata;
    await db.insert(modelUsagesTable).values({
      id: generateId(),
      modelId: aiArgs.model.toString(),
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

export const trackedStreamText = (
  args: Parameters<typeof streamText>[0] & {
    userId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
  },
): ReturnType<typeof streamText> => {
  const { userId, pdfId, chatId, messageId, usageType, onFinish, ...aiArgs } =
    args;

  const result = streamText({
    ...aiArgs,
    onFinish: async (event) => {
      try {
        await onFinish?.(event);
        const gateway = event.providerMetadata?.gateway as GatewayMetadata;
        await db.insert(modelUsagesTable).values({
          id: generateId(),
          modelId: aiArgs.model.toString(),
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
