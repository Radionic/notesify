import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sanitizeFilename from "sanitize-filename";
import z from "zod";

export const storageTypeSchema = z.enum(["pdfs", "recordings", "pdf-images"]);
export type StorageType = z.infer<typeof storageTypeSchema>;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

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
  const bucket = process.env.AWS_BUCKET;
  if (!bucket) {
    return;
  }

  const parts = [type, userId, ...(subfolders ?? [])];
  const prefix = `${parts.join("/")}/`;

  let continuationToken: string | undefined;

  do {
    const res = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    const contents = res.Contents ?? [];
    if (!contents.length) {
      break;
    }

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: contents
            .filter(
              (obj): obj is { Key: string } => typeof obj.Key === "string",
            )
            .map((obj) => ({ Key: obj.Key })),
          Quiet: true,
        },
      }),
    );

    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
};

export const getFileUrlFromStorage = async ({
  type,
  userId,
  filename,
  expiresIn,
}: {
  type: StorageType;
  userId: string;
  filename: string;
  expiresIn?: number;
}) => {
  const key = getObjectKey({ type, userId, filename });

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    }),
    { expiresIn: expiresIn ?? 3600 },
  );

  return url;
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
      const buffer = Buffer.from(arrayBuffer);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );
    }),
  );
};
