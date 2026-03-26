"use client";

import { useState, useCallback, useRef } from "react";
import FilePreview from "./FilePreview";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
  width?: number;
  height?: number;
}

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return `Tip de fișier neacceptat: ${f.type || "necunoscut"}. Acceptăm doar JPG, PNG și PDF.`;
    }
    if (f.size > MAX_SIZE) {
      return `Fișierul e prea mare (${(f.size / 1024 / 1024).toFixed(1)}MB). Limita e 50MB.`;
    }
    return null;
  };

  const processFile = useCallback(async (f: File) => {
    setError(null);
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la upload");
      }

      const data = await res.json();

      let previewUrl: string | null = null;
      if (f.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(f);
      }

      setFile({
        name: data.name,
        size: data.size,
        type: data.type,
        previewUrl,
        width: data.width,
        height: data.height,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const reset = () => {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (file) {
    return <FilePreview file={file} onReset={reset} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-16
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-200
          ${
            dragOver
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Se încarcă...</p>
          </div>
        ) : (
          <>
            <p className="text-foreground font-medium text-lg">
              Trage fișierul aici
            </p>
            <p className="text-muted text-sm">
              sau click pentru a selecta
            </p>
            <p className="text-muted text-xs mt-2">
              JPG, PNG, PDF — max 50MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
