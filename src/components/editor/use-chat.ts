"use client";

import { faker } from "@faker-js/faker";
import { useChat as useBaseChat } from "@ai-sdk/react";

import { streamText } from "ai";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useSetAtom } from "jotai";

export const useChat = () => {
  const getModel = useSetAtom(getSelectedModelAtom);

  return useBaseChat({
    id: "editor",
    fetch: async (input, init) => {
      const model = await getModel("Chat");
      if (!model) {
        return new Response("Please provide API key and select a model");
      }
      const body = JSON.parse(init?.body?.toString() ?? "{}");
      const res = await streamText({
        model,
        system: body?.system,
        messages: body?.messages,
      });
      return res.toDataStreamResponse();
    },
  });
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  streamProtocol = "data",
}: {
  chunkCount?: number;
  streamProtocol?: "data" | "text";
} = {}) => {
  const chunks = Array.from({ length: chunkCount }, () => ({
    delay: faker.number.int({ max: 150, min: 50 }),
    texts: faker.lorem.words({ max: 3, min: 1 }) + " ",
  }));
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, chunk.delay));

        if (streamProtocol === "text") {
          controller.enqueue(encoder.encode(chunk.texts));
        } else {
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`)
          );
        }
      }

      if (streamProtocol === "data") {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${chunks.length}}}\n`
        );
      }

      controller.close();
    },
  });
};
