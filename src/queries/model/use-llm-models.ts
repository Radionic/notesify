import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { PublicModel } from "@/atoms/setting/providers";
import { getLlmModelsFn } from "@/server/model";

export const useLlmModels = ({ enabled }: { enabled?: boolean } = {}) => {
  const getLlmModels = useServerFn(getLlmModelsFn);

  return useQuery<PublicModel[]>({
    queryKey: ["llm-models"],
    queryFn: getLlmModels,
    enabled,
  });
};
