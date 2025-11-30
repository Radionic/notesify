import { getFileUrlFn } from "@/server/storage";

export const fetchFileBlob = async ({
  dirName,
  filename,
  errorMessage,
}: {
  dirName: string;
  filename: string;
  errorMessage: string;
}): Promise<Blob | null> => {
  const url = await getFileUrlFn({
    data: { dirName, filename },
  });

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(errorMessage);
  }

  return await res.blob();
};
