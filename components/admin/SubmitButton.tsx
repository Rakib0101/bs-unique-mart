"use client";

import { useUploadStatus } from "@/components/admin/UploadStatusContext";

export default function SubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { isUploading } = useUploadStatus();
  return (
    <button type="submit" disabled={isUploading} className={className}>
      {isUploading ? "Uploading…" : label}
    </button>
  );
}
