import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRouter } from "@/router";
import { getFileDataFn } from "@/server/storage";

export const useDownloadImage = () => {
  const getFileData = useServerFn(getFileDataFn);

  return useMutation({
    mutationFn: async ({
      imageId,
      filename,
    }: {
      imageId: string;
      filename: string;
    }) => {
      const response = await getFileData({
        data: { type: "images", fileId: imageId },
      });
      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    },
  });
};

export const useNavigateImage = () => {
  const navigateImage = async ({ imageId }: { imageId: string }) => {
    getRouter().navigate({
      to: "/viewer",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        fid: imageId,
        type: "image" as const,
        fo: true,
      }),
    });
  };

  return { navigateImage };
};
