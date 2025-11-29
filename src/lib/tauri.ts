import * as path from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  remove,
  writeFile,
} from "@tauri-apps/plugin-fs";

export const isTauri = false; // "isTauri" in window;

const memStorage: Record<string, any> = {};

export const createOrGetDir = async (dirName: string) => {
  if (!isTauri) {
    console.log("[mem] create or get dir", dirName);
    return memStorage[dirName] ?? (memStorage[dirName] = {});
  }
  const dir = await path.join(await path.appDataDir(), dirName);
  if (!(await exists(dir))) {
    await mkdir(dir);
  }
  return dir;
};

export const getFilePath = async (dirName: string, filename: string) => {
  return await path.join(await createOrGetDir(dirName), filename);
};

export const readNativeFile = async (dirName: string, filename: string) => {
  if (!isTauri) {
    console.log("[mem] read file", dirName, filename);
    return memStorage[`${dirName}/${filename}`];
  }
  const filePath = await getFilePath(dirName, filename);
  return await readFile(filePath);
};

export const writeNativeFile = async (
  dirName: string,
  filename: string,
  data: Blob,
) => {
  if (!isTauri) {
    console.log("[mem] write file", dirName, filename, data);
    memStorage[`${dirName}/${filename}`] = data;
    return;
  }
  const filePath = await getFilePath(dirName, filename);
  const buffer = new Uint8Array(await data.arrayBuffer());
  return await writeFile(filePath, buffer);
};

export const removeNativeFile = async (dirName: string, filename: string) => {
  if (!isTauri) {
    console.log("[mem] remove file", dirName, filename);
    delete memStorage[`${dirName}/${filename}`];
    return;
  }
  const filePath = await getFilePath(dirName, filename);
  return await remove(filePath);
};
