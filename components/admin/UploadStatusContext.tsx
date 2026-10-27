"use client";

import { createContext, useCallback, useContext, useState } from "react";

const UploadStatusContext = createContext<{
  setUploading: (id: string, uploading: boolean) => void;
  isUploading: boolean;
} | null>(null);

export function UploadStatusProvider({ children }: { children: React.ReactNode }) {
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());

  const setUploading = useCallback((id: string, uploading: boolean) => {
    setActiveUploads((prev) => {
      const next = new Set(prev);
      if (uploading) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return (
    <UploadStatusContext.Provider value={{ setUploading, isUploading: activeUploads.size > 0 }}>
      {children}
    </UploadStatusContext.Provider>
  );
}

export function useUploadStatus() {
  const ctx = useContext(UploadStatusContext);
  if (!ctx) throw new Error("useUploadStatus must be used within UploadStatusProvider");
  return ctx;
}
