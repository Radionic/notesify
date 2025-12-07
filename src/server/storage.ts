import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getSession } from "@/lib/auth";
import {
  getFileFromStorage,
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

const getFileDataSchema = z.object({
  type: storageTypeSchema,
  filename: z.string(),
});

export const getFileDataFn = createServerFn()
  .inputValidator(getFileDataSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const body = await getFileFromStorage({
      type: data.type,
      userId: session.user.id,
      filename: data.filename,
    });

    if (!body) {
      return new Response("Not Found", { status: 404 });
    }

    const contentType =
      data.type === "pdfs"
        ? "application/pdf"
        : data.type === "recordings"
          ? "audio/webm"
          : "image/jpeg"; // "pdf-images"

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
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
