import { toast } from "sonner";
import type { PublicModel } from "@/atoms/setting/providers";

export const ensureVisionModel = ({
  model,
}: {
  model?: PublicModel;
}): boolean => {
  const isVisionModel = model?.type === "vlm";
  if (!isVisionModel) {
    toast.warning(
      "This model does not support image context. Please select a Vision model.",
      {
        position: "top-right",
      },
    );
    return false;
  }
  return true;
};
