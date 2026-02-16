import { atom } from "jotai";

export type UploadStatus = "uploading" | "error" | "success";

export type UploadState = {
  status: UploadStatus;
  progress: number;
  error?: string;
};

export const uploadStatusAtom = atom<Record<string, UploadState>>({});
export const uploadingIdsAtom = atom<string[]>([]);
