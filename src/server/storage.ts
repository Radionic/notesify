import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const getObjectKey = (dirName: string, filename: string) =>
  `${dirName}/${filename}`;

const writeFileSchema = z.object({
  dirName: z.string(),
  filename: z.string(),
  base64: z.string(),
  contentType: z.string().optional(),
});

export const writeFileFn = createServerFn()
  .inputValidator(writeFileSchema)
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.base64, "base64");
    const key = getObjectKey(data.dirName, data.filename);

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
  dirName: z.string(),
  filename: z.string(),
});

export const removeFileFn = createServerFn()
  .inputValidator(removeFileSchema)
  .handler(async ({ data }) => {
    const key = getObjectKey(data.dirName, data.filename);
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
  dirName: z.string(),
  filename: z.string(),
  expiresIn: z.number().optional(),
});

export const getFileUrlFn = createServerFn()
  .inputValidator(getFileUrlSchema)
  .handler(async ({ data }) => {
    const key = getObjectKey(data.dirName, data.filename);

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
  dirName: string;
  filename: string;
  file: File;
};

export const uploadFileFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData): UploadFileInput => {
    const dirName = formData.get("dirName");
    const filename = formData.get("filename");
    const file = formData.get("file");

    if (!dirName || typeof dirName !== "string") {
      throw new Error("dirName is required");
    }

    if (!filename || typeof filename !== "string") {
      throw new Error("filename is required");
    }

    if (!file || !(file instanceof File)) {
      throw new Error("file is required and must be a File");
    }

    return { dirName, filename, file };
  })
  .handler(async ({ data }: { data: UploadFileInput }) => {
    const { dirName, filename, file } = data;
    const key = getObjectKey(dirName, filename);

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
