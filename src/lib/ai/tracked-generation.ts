import { generateObject, generateText, streamText } from "ai";
import type { infer as ZodInfer, ZodTypeAny } from "zod";
import { db } from "@/db";
import { type ModelUsageType, modelUsagesTable } from "@/db/schema";
import { generateId } from "@/lib/id";

export const trackedGenerateText = async (
  args: Parameters<typeof generateText>[0] & {
    userId: string;
    modelId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
  },
): Promise<Awaited<ReturnType<typeof generateText>>> => {
  const { userId, modelId, pdfId, chatId, messageId, usageType, ...aiArgs } =
    args;

  const result = await generateText(aiArgs);
  await db.insert(modelUsagesTable).values({
    id: generateId(),
    userId,
    modelId,
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
  });
  return result;
};

export function trackedGenerateObject<S extends ZodTypeAny>(
  args: Parameters<typeof generateObject>[0] & {
    schema: S;
    userId: string;
    modelId: string;
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
    modelId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
  },
): Promise<Awaited<ReturnType<typeof generateObject>>> {
  const { userId, modelId, pdfId, chatId, messageId, usageType, ...aiArgs } =
    args;

  const result = await generateObject(
    aiArgs as Parameters<typeof generateObject>[0],
  );
  await db.insert(modelUsagesTable).values({
    id: generateId(),
    userId,
    modelId,
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
  });
  return result;
}

export const trackedStreamText = (
  args: Parameters<typeof streamText>[0] & {
    userId: string;
    modelId: string;
    pdfId?: string;
    chatId?: string;
    messageId?: string;
    usageType: ModelUsageType;
  },
): ReturnType<typeof streamText> => {
  const {
    userId,
    modelId,
    pdfId,
    chatId,
    messageId,
    usageType,
    onFinish,
    ...aiArgs
  } = args;

  const result = streamText({
    ...aiArgs,
    onFinish: async (event) => {
      await onFinish?.(event);
     console.log("event.totalUsage", event.totalUsage, event.usage, event.response.messages[0].content);
      await db.insert(modelUsagesTable).values({
        id: generateId(),
        userId,
        modelId,
        chatId,
        messageId,
        pdfId,
        type: usageType,
        promptTokens: event.usage?.inputTokens,
        cachedInputTokens: event.usage?.cachedInputTokens,
        completionTokens: event.usage?.outputTokens,
        reasoningTokens: event.usage?.reasoningTokens,
        totalTokens: event.usage?.totalTokens,
        finishReason: event.finishReason,
      });
    },
  } as Parameters<typeof streamText>[0]);

  return result;
};
