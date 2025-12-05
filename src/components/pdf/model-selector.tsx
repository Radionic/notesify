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

export const ModelSelector = () => {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);

  const getLlmModels = useServerFn(getLlmModelsFn);
  const { data: models = [], isLoading } = useQuery({
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
  const displayedModels =
    selectedModel && models.length > 0
      ? [selectedModel, ...models.filter((m) => m.id !== selectedModel.id)]
      : models;

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
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search model" />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading models..." : "No models available"}
            </CommandEmpty>
            <CommandGroup>
              {displayedModels.map((model: Model) => (
                <CommandItem
                  key={model.id}
                  value={model.name}
                  onSelect={() => {
                    // Always keep a model selected
                    setSelectedModel(model);
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {getProviderIcon(model.provider)}
                    <span className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.type === "vlm" && (
                        <Badge className="text-[10px]">Vision</Badge>
                      )}
                    </span>
                  </span>
                  <Check
                    className={cn(
                      "ml-auto",
                      !selectedModel || selectedModel.id !== model.id
                        ? "opacity-0"
                        : "",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
