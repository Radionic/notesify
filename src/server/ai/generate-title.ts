import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import z from "zod";
import { aiProvider } from "@/lib/ai/provider";
import { updateChatTitle } from "@/lib/db/chat";

const GenerateTitleSchema = z.object({
  chatId: z.string(),
  text: z.string(),
});

export const generateTitleFn = createServerFn({ method: "POST" })
  .inputValidator(GenerateTitleSchema)
  .handler(async ({ data }) => {
    const prompt = `Create a short title for the following text. Do not use Markdown.\n${data.text}`;
    const { text: title } = await generateText({
      model: aiProvider.chatModel("openai/gpt-5-nano"),
      prompt,
    });
    await updateChatTitle(data.chatId, title);
    return title;
  });
