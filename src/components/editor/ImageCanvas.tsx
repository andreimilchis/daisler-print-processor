"use client";

import { useEditor } from "@/lib/editor-context";
import CropTool from "./CropTool";

export default function ImageCanvas() {
  const { fileData, cropMode, params } = useEditor();

  if (!fileData) return null;

  if (fileData.type === "application/pdf") {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-12">
          <svg className="w-20 h-20 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          </svg>
          <p className="font-medium text-foreground text-lg">{fileData.name}</p>
          <p className="text-muted text-sm mt-1">
            {(fileData.size / 1024 / 1024).toFixed(1)} MB — PDF
          </p>
          <p className="text-muted text-xs mt-3">
            Selectează un format și apasă Generează PDF
          </p>
        </div>
      </div>
    );
  }

  if (cropMode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4 overflow-auto">
        <CropTool />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-6 overflow-auto">
      <div className="relative inline-block">
        <img
          src={fileData.previewUrl}
          alt={fileData.name}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
        />
        {params.bleedMm > 0 && params.targetWidthMm > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-lg" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-500 bg-white px-2 rounded">
              bleed {params.bleedMm}mm
            </span>
          </div>
        )}
        <div className="mt-3 text-center text-xs text-muted">
          {fileData.width} × {fileData.height} px
          {params.targetWidthMm > 0 && (
            <span className="ml-2">
              → {params.targetWidthMm} × {params.targetHeightMm} mm
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
