import {
  Anthropic,
  DeepSeek,
  Google,
  Moonshot,
  OpenAI,
  Qwen,
  XAI,
} from "@lobehub/icons";
import { useAtom } from "jotai";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { match } from "ts-pattern";
import { type Model, selectedModelAtom } from "@/atoms/setting/providers";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLlmModels } from "@/queries/model/use-llm-models";
import { Badge } from "../badge";
import { TooltipButton } from "../tooltip/tooltip-button";

const RECOMMENDED_MODEL_IDS = [
  "google/gemini-3-flash",
  "openai/gpt-5.2",
  "xai/grok-4.1-fast-non-reasoning",
  "xai/grok-4.1-fast-reasoning",
  "deepseek/deepseek-v3.2",
  "deepseek/deepseek-v3.2-thinking",
];

const PROVIDER_ORDER = [
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
const compareByProvider = (a: Model, b: Model) => {
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

const compareByName = (a: Model, b: Model) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const getThinkingPriority = (thinking: Model["thinking"]) => {
  if (!thinking) return 0;
  if (thinking === "unspecified") return 1;
  if (thinking === "low") return 2;
  if (thinking === "medium") return 3;
  return 4;
};

const compareByThinking = (a: Model, b: Model) =>
  getThinkingPriority(a.thinking) - getThinkingPriority(b.thinking);

const sortModels = (a: Model, b: Model) =>
  compareByProvider(a, b) || compareByName(a, b) || compareByThinking(a, b);

const getModelDisplayName = (model: Model) => {
  if (!model.thinking) return model.name;
  if (model.thinking === "unspecified") return `${model.name} (Thinking)`;
  return `${model.name} (${model.thinking.charAt(0).toUpperCase()}${model.thinking.slice(1)} Thinking)`;
};

const getProviderIcon = (provider: string) => {
  return match(provider.toLowerCase())
    .with("anthropic", () => <Anthropic className="h-4 w-4" />)
    .with("deepseek", () => <DeepSeek.Color className="h-4 w-4" />)
    .with("google", () => <Google.Color className="h-4 w-4" />)
    .with("alibaba", () => <Qwen.Color className="h-4 w-4" />)
    .with("moonshot", () => <Moonshot className="h-4 w-4" />)
    .with("openai", () => <OpenAI className="h-4 w-4" />)
    .with("xai", () => <XAI className="h-4 w-4" />)
    .otherwise(() => <RiRobot2Line className="h-4 w-4 opacity-60" />);
};

export const ModelSelector = () => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
  const { data: models = [], isLoading } = useLlmModels();

  const sortedModels = [...models].sort(sortModels);

  const modelsById = new Map(models.map((m) => [m.id, m]));
  const recommendedModels = RECOMMENDED_MODEL_IDS.map((id) =>
    modelsById.get(id),
  ).filter((m) => !!m);

  const displayedModels = showAll ? sortedModels : recommendedModels;

  const renderModelItem = (model: Model) => (
    <CommandItem
      key={model.id}
      value={`${model.provider}-${model.name}-${model.thinking}`}
      onSelect={() => {
        // Always keep a model selected
        setSelectedModel(model);
        setOpen(false);
      }}
    >
      <span className="flex items-center gap-2">
        {getProviderIcon(model.provider)}
        <span>{getModelDisplayName(model)}</span>
      </span>
      <span className="ml-auto flex items-center gap-2">
        {model.type === "vlm" && <Badge className="text-[10px]">Vision</Badge>}
        {selectedModel && selectedModel.id === model.id && <Check />}
      </span>
    </CommandItem>
  );

  // Auto-select a default model once models load
  useEffect(() => {
    if (!isLoading && models.length > 0 && !selectedModel) {
      const defaultModel =
        models.find((m) => m.id === import.meta.env.VITE_DEFAULT_MODEL_ID) ??
        models[0];
      setSelectedModel(defaultModel);
    }
  }, [isLoading, models, selectedModel, setSelectedModel]);

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setShowAll(false);
        }
      }}
    >
      <PopoverTrigger className="w-full">
        <TooltipButton tooltip="AI Model">
          <RiRobot2Line className="opacity-50 size-5!" />
          {selectedModel && (
            <span className="text-muted-foreground">
              {getModelDisplayName(selectedModel)}
            </span>
          )}
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80">
        <Command>
          <CommandInput placeholder="Search model" />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading models..." : "No models available"}
            </CommandEmpty>
            <CommandGroup
              heading={showAll ? "All Models" : "Recommended Models"}
            >
              {displayedModels.map(renderModelItem)}
              {!showAll && (
                <CommandItem
                  onSelect={() => setShowAll(true)}
                  className="justify-center text-muted-foreground font-medium"
                >
                  Show All Models
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
