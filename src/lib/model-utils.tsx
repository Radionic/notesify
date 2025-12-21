import {
  Anthropic,
  DeepSeek,
  Google,
  Moonshot,
  OpenAI,
  Qwen,
  XAI,
  XiaomiMiMo,
} from "@lobehub/icons";
import { RiRobot2Line } from "react-icons/ri";
import { match } from "ts-pattern";
import type { PublicModel } from "@/atoms/setting/providers";

export const RECOMMENDED_MODEL_IDS = [
  "google/gemini-3-flash",
  "openai/gpt-5.2",
  "xai/grok-4.1-fast-non-reasoning",
  "xai/grok-4.1-fast-reasoning",
  "deepseek/deepseek-v3.2",
  "deepseek/deepseek-v3.2-thinking",
];

export const PROVIDER_ORDER = [
  "google",
  "openai",
  "xai",
  "anthropic",
  "deepseek",
  "alibaba",
  "moonshot",
];
const providerOrderMap = new Map(PROVIDER_ORDER.map((p, i) => [p, i]));

// Comparator utilities
export const compareByProvider = (a: PublicModel, b: PublicModel) => {
  const pA = a.provider.toLowerCase();
  const pB = b.provider.toLowerCase();
  if (pA === pB) return 0;

  const idxA = providerOrderMap.get(pA);
  const idxB = providerOrderMap.get(pB);

  // Both have explicit priority
  if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
  // Only one has explicit priority
  if (idxA !== undefined) return -1;
  if (idxB !== undefined) return 1;
  // Fallback to alphabetical
  return pA.localeCompare(pB, undefined, { sensitivity: "base" });
};

export const compareByName = (a: PublicModel, b: PublicModel) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

export const getThinkingPriority = (thinking: PublicModel["thinking"]) => {
  if (!thinking) return 0;
  if (thinking === "unspecified") return 1;
  if (thinking === "low") return 2;
  if (thinking === "medium") return 3;
  return 4;
};

export const compareByThinking = (a: PublicModel, b: PublicModel) =>
  getThinkingPriority(a.thinking) - getThinkingPriority(b.thinking);

export const sortModels = (a: PublicModel, b: PublicModel) =>
  compareByProvider(a, b) || compareByName(a, b) || compareByThinking(a, b);

export const getModelDisplayName = (model: PublicModel) => {
  if (!model.thinking) return model.name;
  if (model.thinking === "unspecified") return `${model.name} (Thinking)`;
  return `${model.name} (${model.thinking.charAt(0).toUpperCase()}${model.thinking.slice(1)} Thinking)`;
};

export const getProviderIcon = (provider: string, className?: string) => {
  const cn = className || "h-4 w-4";
  return match(provider.toLowerCase())
    .with("anthropic", () => <Anthropic className={cn} />)
    .with("deepseek", () => <DeepSeek.Color className={cn} />)
    .with("google", () => <Google.Color className={cn} />)
    .with("alibaba", () => <Qwen.Color className={cn} />)
    .with("moonshot", () => <Moonshot className={cn} />)
    .with("openai", () => <OpenAI className={cn} />)
    .with("xai", () => <XAI className={cn} />)
    .with("xiaomi", () => <XiaomiMiMo className={cn} />)
    .otherwise(() => <RiRobot2Line className={`${cn} opacity-60`} />);
};
