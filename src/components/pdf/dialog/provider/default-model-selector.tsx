import { useAtom } from "jotai";
import { type ModelType, selectedModelsAtom } from "@/atoms/setting/providers";
import { Label } from "@/components/ui/label";
import { ModelSelector } from "../../model-selector";

export const DefaultModelSelector = ({
  modelType,
}: {
  modelType: ModelType;
}) => {
  const [selectedModels, setSelectedModels] = useAtom(selectedModelsAtom);
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="notes-model">{modelType}</Label>
      <div className="w-2/3">
        <ModelSelector
          variant="select"
          modelType={modelType}
          model={selectedModels[modelType]}
          onChange={(model) =>
            setSelectedModels({
              ...selectedModels,
              [modelType]: model,
            })
          }
        />
      </div>
    </div>
  );
};
