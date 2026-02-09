import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWebpageFn } from "@/server/webpages";

export const useWebpage = ({ webpageId }: { webpageId: string }) => {
  const getWebpage = useServerFn(getWebpageFn);

  return useQuery({
    queryKey: ["webpage", webpageId],
    queryFn: () => getWebpage({ data: { id: webpageId } }),
    enabled: !!webpageId,
  });
};
