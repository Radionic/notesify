import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import sanitizeFilename from "sanitize-filename";
import z from "zod";
import { getSession } from "@/lib/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const storageTypeSchema = z.enum(["pdfs", "recordings"]);
type StorageType = z.infer<typeof storageTypeSchema>;

const getObjectKey = (type: StorageType, userId: string, filename: string) =>
  `${type}/${userId}/${sanitizeFilename(filename)}`;

const writeFileSchema = z.object({
  type: storageTypeSchema,
  filename: z.string(),
  base64: z.string(),
  contentType: z.string().optional(),
});

export const writeFileFn = createServerFn()
  .inputValidator(writeFileSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const buffer = Buffer.from(data.base64, "base64");
    const key = getObjectKey(data.type, session.user.id, data.filename);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: data.contentType,
      }),
    );
  });

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

    const key = getObjectKey(data.type, session.user.id, data.filename);
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const err = error as { $metadata?: { httpStatusCode?: number } };
      if (err?.$metadata?.httpStatusCode === 404) {
        return;
      }
      throw error;
    }
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

    const key = getObjectKey(data.type, session.user.id, data.filename);

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      }),
      { expiresIn: data.expiresIn ?? 3600 },
    );

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

    const { type, filename, file } = data;
    const key = getObjectKey(type, session.user.id, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );
  });
