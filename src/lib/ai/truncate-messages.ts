import type { ModelMessage } from "ai";

/**
 * Truncates input to fit within maxInputChars.
 * Truncation rules for messages:
 * 1. First message after truncation must be a user message
 * 2. Only truncate full messages (never partial content)
 * 3. If first message would be assistant after truncation, discard it too
 */
export const truncateMessages = (
  input: { prompt?: string | ModelMessage[]; messages?: ModelMessage[] },
  maxInputChars: number | null | undefined,
): { prompt?: string | ModelMessage[]; messages?: ModelMessage[] } => {
  // Check if prompt exists
  if (input.prompt) {
    return {
      prompt:
        typeof input.prompt === "string" && maxInputChars
          ? input.prompt.slice(-maxInputChars)
          : input.prompt,
    };
  }

  // Otherwise handle messages
  const messages = input.messages || [];
  if (!maxInputChars || messages.length === 0) {
    return { messages };
  }

  // Calculate total character count
  const getMessageLength = (msg: ModelMessage): number => {
    if (typeof msg.content === "string") {
      return msg.content.length;
    }
    if (Array.isArray(msg.content)) {
      return msg.content.reduce((sum, part) => {
        if (part.type === "text") {
          return sum + part.text.length;
        }
        return sum;
      }, 0);
    }
    return 0;
  };

  const totalLength = messages.reduce(
    (sum, msg) => sum + getMessageLength(msg),
    0,
  );

  // No truncation needed
  if (totalLength <= maxInputChars) {
    return { messages };
  }

  // Truncate from the beginning
  let currentLength = 0;
  let startIndex = messages.length;

  // Work backwards to find where to start
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgLength = getMessageLength(messages[i]);
    if (currentLength + msgLength > maxInputChars) {
      startIndex = i + 1;
      break;
    }
    currentLength += msgLength;
    startIndex = i;
  }

  // Ensure we have at least one message
  if (startIndex >= messages.length) {
    startIndex = messages.length - 1;
  }

  let truncated = messages.slice(startIndex);

  // First message must be user message
  // If first message is assistant, discard it
  while (truncated.length > 0 && truncated[0].role !== "user") {
    truncated = truncated.slice(1);
  }

  return { messages: truncated };
};
