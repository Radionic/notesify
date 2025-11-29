import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { LuSettings } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";

import {
  availableModelsAtom,
  type Model,
  type ModelType,
  openSettingsDialogAtom,
  selectedModelsAtom,
} from "@/atoms/setting/providers";
import { Button } from "@/components/ui/button";
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
import { TooltipButton } from "../tooltip/tooltip-button";

export type SelectItem = {
  label: string;
  value: Model;
};

const OCR_MODELS = ["mistral-ocr-latest"];

export const ModelSelector = ({
  variant,
  showModelName,
  modelType = "Chat",
  model, // If model is provided, the setSelectedModel is controlled by the caller
  onChange,
}: {
  variant: "button" | "select";
  showModelName?: boolean;
  modelType?: ModelType;
  model?: Model;
  onChange?: (value?: Model) => void;
}) => {
  const [open, setOpen] = useState(false);
  const models = useAtomValue(availableModelsAtom);
  const [selectedModels, setSelectedModels] = useAtom(selectedModelsAtom);
  const setOpenSettings = useSetAtom(openSettingsDialogAtom);

  const modelItems = Object.entries(models)
    .flatMap(([provider, models]) =>
      models.map((model) => ({
        label: model.name,
        value: model,
      })),
    )
    .filter(
      (model) =>
        modelType !== "Document Parser" || OCR_MODELS.includes(model.value.id),
    );

  const selectedItem = model
    ? { label: model.name, value: model }
    : modelItems?.find(
        (model) => model.label === selectedModels[modelType]?.name,
      );

  // Pin selected model to the top
  const displayedItems =
    selectedItem && modelItems
      ? [
          selectedItem,
          ...modelItems.filter((item) => item.label !== selectedItem.label),
        ]
      : (modelItems ?? []);

  const notFoundHint =
    variant === "button" ? (
      <>
        <p>No model found</p>
        <Button
          variant="link"
          className="underline"
          onClick={() => setOpenSettings(true)}
        >
          Manage your models
        </Button>
      </>
    ) : (
      <>
        <p>No model found</p>
        <p>Please provide API key first</p>
      </>
    );

  const actionButtons = variant === "button" && (
    <Button
      variant="ghost"
      size="icon"
      className="opacity-50 w-8 h-8 p-2"
      onClick={() => setOpenSettings(true)}
    >
      <LuSettings />
    </Button>
  );

  const triggerButton =
    variant === "button" ? (
      <TooltipButton tooltip="AI Model">
        <RiRobot2Line className="opacity-50 size-5!" />
        {showModelName && selectedItem && (
          <span className="text-muted-foreground">
            {selectedItem.value.name}
          </span>
        )}
      </TooltipButton>
    ) : (
      <Button
        variant="outline"
        type="button"
        className="w-full justify-between bg-background px-3"
      >
        <span
          className={cn("truncate", !selectedItem && "text-muted-foreground")}
        >
          {selectedItem
            ? selectedItem.value.name
            : `Select ${modelType.toLowerCase()} model`}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="shrink-0 text-muted-foreground/80"
        />
      </Button>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">{triggerButton}</PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Search model"
            actionButtons={actionButtons}
          />
          <CommandList>
            <CommandEmpty>{notFoundHint}</CommandEmpty>
            <CommandGroup>
              {displayedItems.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.label}
                  onSelect={() => {
                    const selectedValue =
                      item.label === selectedItem?.label ? undefined : item;
                    onChange?.(selectedValue?.value);
                    if (!model && selectedValue) {
                      setSelectedModels((prev) => ({
                        ...prev,
                        [modelType]: selectedValue.value,
                      }));
                    }
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedItem?.label !== item.label && "opacity-0",
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
