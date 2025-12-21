import { useAtom } from "jotai";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import {
  type PublicModel,
  selectedModelAtom,
} from "@/atoms/setting/providers";
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
import {
  getModelDisplayName,
  getProviderIcon,
  RECOMMENDED_MODEL_IDS,
  sortModels,
} from "@/lib/model-utils";
import { useLlmModels } from "@/queries/model/use-llm-models";
import { Badge } from "../badge";
import { TooltipButton } from "../tooltip/tooltip-button";

export const ModelSelector = () => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
  const { data, isLoading } = useLlmModels();
  const models: PublicModel[] = data || [];

  const sortedModels = [...models].sort(sortModels);

  const modelsById = new Map(models.map((m) => [m.id, m]));
  const recommendedModels = RECOMMENDED_MODEL_IDS.map((id) =>
    modelsById.get(id),
  ).filter((m) => !!m);

  const displayedModels = showAll ? sortedModels : recommendedModels;

  const renderModelItem = (model: PublicModel) => (
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
