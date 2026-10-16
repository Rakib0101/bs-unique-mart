import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function safeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

/** Saves an uploaded file under public/uploads/<folder> and returns its public URL path. */
export async function saveUpload(file: File, folder: string): Promise<string> {
  const dir = path.join(UPLOADS_ROOT, folder);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${safeExt(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
