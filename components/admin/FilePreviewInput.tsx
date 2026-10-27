"use client";

import { useId, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useUploadStatus } from "@/components/admin/UploadStatusContext";

type UploadedFile = { url: string; previewUrl: string };

export default function FilePreviewInput({
  name,
  multiple,
}: {
  name: string;
  multiple?: boolean;
}) {
  const id = useId();
  const { setUploading } = useUploadStatus();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (selected.length === 0) return;

    setError(null);
    setBusy(true);
    setUploading(id, true);
    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          return { url: blob.url, previewUrl: URL.createObjectURL(file) };
        }),
      );
      setFiles((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
      setUploading(id, false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        disabled={busy}
        className="text-sm"
      />
      {busy ? <p className="mt-2 text-xs text-ink/50">Uploading…</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {files.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <div key={f.url}>
              <input type="hidden" name={name} value={f.url} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt=""
                className="h-20 w-20 rounded-lg border border-surface-line object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
