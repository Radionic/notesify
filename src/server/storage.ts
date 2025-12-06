import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getSession } from "@/lib/auth";
import {
  getFileUrlFromStorage,
  removeFileFromStorage,
  type StorageType,
  storageTypeSchema,
  uploadFilesToStorage,
} from "@/lib/storage";

const removeFileSchema = z.object({
  type: storageTypeSchema,
  filename: z.string(),
});

export const removeFileFn = createServerFn()
  .inputValidator(removeFileSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await removeFileFromStorage({
      type: data.type,
      userId: session.user.id,
      filename: data.filename,
    });
  });

const getFileUrlSchema = z.object({
  type: storageTypeSchema,
  filename: z.string(),
  expiresIn: z.number().optional(),
});

export const getFileUrlFn = createServerFn()
  .inputValidator(getFileUrlSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const url = await getFileUrlFromStorage({
      type: data.type,
      userId: session.user.id,
      filename: data.filename,
      expiresIn: data.expiresIn,
    });

    return url;
  });

type UploadFileInput = {
  type: StorageType;
  filename: string;
  file: File;
};

export const uploadFileFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData): UploadFileInput => {
    const type = formData.get("type");
    const filename = formData.get("filename");
    const file = formData.get("file");

    const parsedType = storageTypeSchema.safeParse(type);
    if (!parsedType.success) {
      throw new Error("Invalid type");
    }

    if (typeof filename !== "string") {
      throw new Error("filename is required");
    }

    if (!file || !(file instanceof File)) {
      throw new Error("file is required and must be a File");
    }

    return { type: parsedType.data, filename, file };
  })
  .handler(async ({ data }: { data: UploadFileInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await uploadFilesToStorage({
      userId: session.user.id,
      files: [
        {
          type: data.type,
          filename: data.filename,
          file: data.file,
        },
      ],
    });
  });
