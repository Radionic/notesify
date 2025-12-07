// @ts-ignore
import { env } from "cloudflare:workers";
import sanitizeFilename from "sanitize-filename";
import z from "zod";

export const storageTypeSchema = z.enum(["pdfs", "recordings", "pdf-images"]);
export type StorageType = z.infer<typeof storageTypeSchema>;

type R2Bucket = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null,
    options?: {
      httpMetadata?: Record<string, unknown>;
    },
  ) => Promise<unknown>;
  delete: (key: string) => Promise<unknown>;
  list: (options: {
    prefix?: string;
    cursor?: string;
    limit?: number;
  }) => Promise<{
    objects: { key: string }[];
    truncated: boolean;
    cursor?: string;
  }>;
  get: (
    key: string,
    options?: Record<string, unknown>,
  ) => Promise<{
    body: ReadableStream | null;
  } | null>;
};

const bucket: R2Bucket = env.BUCKET;

const getObjectKey = ({
  type,
  userId,
  filename,
  subfolders,
}: {
  type: StorageType;
  userId: string;
  filename: string;
  subfolders?: string[];
}) => {
  const safeFilename = sanitizeFilename(filename);
  const parts = [type, userId, ...(subfolders ?? []), safeFilename];
  return parts.join("/");
};

export const removeFileFromStorage = async ({
  type,
  userId,
  filename,
}: {
  type: StorageType;
  userId: string;
  filename: string;
}) => {
  const key = getObjectKey({ type, userId, filename });
  await bucket.delete(key);
};

export const removeFolderFromStorage = async ({
  type,
  userId,
  subfolders,
}: {
  type: StorageType;
  userId: string;
  subfolders?: string[];
}) => {
  const parts = [type, userId, ...(subfolders ?? [])];
  const prefix = `${parts.join("/")}/`;

  let cursor: string | undefined;
  do {
    const res = await bucket.list({ prefix, cursor, limit: 1000 });
    const objects = (res?.objects ?? []) as { key: string }[];
    if (!objects.length) {
      break;
    }
    await Promise.all(objects.map((obj) => bucket.delete(obj.key)));

    cursor = res.truncated ? res.cursor : undefined;
  } while (cursor);
};

export const getFileFromStorage = async ({
  type,
  userId,
  filename,
  subfolders,
}: {
  type: StorageType;
  userId: string;
  filename: string;
  subfolders?: string[];
}) => {
  const key = getObjectKey({ type, userId, filename, subfolders });
  const object = await bucket.get(key);
  if (!object || !object.body) {
    return null;
  }
  return object.body;
};

export type UploadFileItem = {
  type: StorageType;
  filename: string;
  file: File;
  subfolders?: string[];
};

export const uploadFilesToStorage = async ({
  userId,
  files,
}: {
  userId: string;
  files: UploadFileItem[];
}) => {
  await Promise.all(
    files.map(async ({ type, filename, file, subfolders }) => {
      const key = getObjectKey({ type, userId, filename, subfolders });

      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
    }),
  );
};
