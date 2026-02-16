import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { filesTable } from "@/db/schema";
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
  fileId: z.string(),
});

export const getFileDataFn = createServerFn()
  .inputValidator(getFileDataSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const file = await db.query.filesTable.findFirst({
      where: and(
        eq(filesTable.id, data.fileId),
        eq(filesTable.userId, session.user.id),
      ),
    });

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // Extract extension from filename
    const extension = file.name.split(".").pop() || "";
    const filename = extension ? `${data.fileId}.${extension}` : data.fileId;

    const body = await getFileFromStorage({
      type: data.type,
      userId: session.user.id,
      filename,
    });

    if (!body) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(body, { status: 200 });
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
