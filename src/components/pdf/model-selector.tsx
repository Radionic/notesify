import {
  Alibaba,
  Anthropic,
  DeepSeek,
  Google,
  Moonshot,
  OpenAI,
  XAI,
} from "@lobehub/icons";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { cn } from "@/lib/utils";
import { getLlmModelsFn } from "@/server/model";
import { Badge } from "../badge";
import { TooltipButton } from "../tooltip/tooltip-button";

const RECOMMENDED_MODEL_IDS = [
  "xai/grok-4.1-fast-non-reasoning",
  "xai/grok-4.1-fast-reasoning",
  "deepseek/deepseek-v3.2",
  "deepseek/deepseek-v3.2-thinking",
];

export const ModelSelector = () => {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);

  const getLlmModels = useServerFn(getLlmModelsFn);
  const { data: models = [], isLoading } = useQuery<Model[]>({
    queryKey: ["llm-models"],
    queryFn: () => getLlmModels({ data: {} }),
  });

  const getProviderIcon = (provider: string) => {
    return match(provider.toLowerCase())
      .with("anthropic", () => <Anthropic className="h-4 w-4" />)
      .with("deepseek", () => <DeepSeek.Color className="h-4 w-4" />)
      .with("google", () => <Google.Color className="h-4 w-4" />)
      .with("alibaba", () => <Alibaba.Color className="h-4 w-4" />)
      .with("moonshot", () => <Moonshot className="h-4 w-4" />)
      .with("openai", () => <OpenAI className="h-4 w-4" />)
      .with("xai", () => <XAI className="h-4 w-4" />)
      .otherwise(() => <RiRobot2Line className="h-4 w-4 opacity-60" />);
  };

  // Pin selected model to the top
  const providerNameSort = (a: Model, b: Model) => {
    const providerCmp = a.provider.localeCompare(b.provider, undefined, {
      sensitivity: "base",
    });
    if (providerCmp !== 0) return providerCmp;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  };

  const recommendedIds = new Set(RECOMMENDED_MODEL_IDS);
  const sortedModels = [...models].sort(providerNameSort);

  const modelsById = new Map(sortedModels.map((m) => [m.id, m] as const));
  const recommendedModels = RECOMMENDED_MODEL_IDS.map((id) =>
    modelsById.get(id),
  ).filter((m): m is Model => m != null);

  const remainingModels = sortedModels.filter((m) => !recommendedIds.has(m.id));

  const selectedIsRecommended = Boolean(
    selectedModel && recommendedIds.has(selectedModel.id),
  );

  const recommendedModelsDisplayed = selectedModel
    ? selectedIsRecommended
      ? [
          selectedModel,
          ...recommendedModels.filter((m) => m.id !== selectedModel.id),
        ]
      : recommendedModels
    : recommendedModels;

  const remainingModelsDisplayed = selectedModel
    ? selectedIsRecommended
      ? remainingModels
      : [
          selectedModel,
          ...remainingModels.filter((m) => m.id !== selectedModel.id),
        ]
    : remainingModels;

  const renderModelItem = (model: Model) => (
    <CommandItem
      key={model.id}
      value={`${model.provider}-${model.name}`}
      onSelect={() => {
        // Always keep a model selected
        setSelectedModel(model);
        setOpen(false);
      }}
    >
      <span className="flex items-center gap-2">
        {getProviderIcon(model.provider)}
        <span>{model.name}</span>
      </span>
      <span className="ml-auto flex items-center gap-2">
        {model.type === "vlm" && <Badge className="text-[10px]">Vision</Badge>}
        <Check
          className={cn(
            !selectedModel || selectedModel.id !== model.id ? "opacity-0" : "",
          )}
        />
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <TooltipButton tooltip="AI Model">
          <RiRobot2Line className="opacity-50 size-5!" />
          {selectedModel && (
            <span className="text-muted-foreground">{selectedModel.name}</span>
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
            {recommendedModelsDisplayed.length > 0 && (
              <CommandGroup heading="Recommended">
                {recommendedModelsDisplayed.map(renderModelItem)}
              </CommandGroup>
            )}
            <CommandGroup heading="All models">
              {remainingModelsDisplayed.map(renderModelItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
