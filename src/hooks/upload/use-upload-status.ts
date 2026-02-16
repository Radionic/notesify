import { useAtom } from "jotai";
import { type UploadState, uploadStatusAtom } from "@/atoms/upload";

export const useUploadStatus = (id?: string) => {
  const [states, setStates] = useAtom(uploadStatusAtom);

  const updateStatus = (
    targetId: string,
    state: Partial<UploadState> | null,
  ) => {
    setStates((prev) => {
      if (state === null) {
        const next = { ...prev };
        delete next[targetId];
        return next;
      }
      const current = prev[targetId] ?? {
        status: "uploading",
        progress: 0,
      };
      return {
        ...prev,
        [targetId]: {
          ...current,
          ...state,
        },
      };
    });
  };

  const getStatus = (targetId: string) => {
    return states[targetId];
  };

  return {
    status: id ? states[id] : undefined,
    updateStatus,
    getStatus,
    isAnyPending: Object.keys(states).length > 0,
  };
};
