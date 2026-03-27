"use client";

import { useEditor } from "@/lib/editor-context";
import { getMockupConfig } from "@/lib/mockup-config";

export default function MockupPreview() {
  const { mockupUrl, params } = useEditor();

  if (!mockupUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f0f0]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Se generează previzualizarea...</p>
        </div>
      </div>
    );
  }

  const config = params.presetId ? getMockupConfig(params.presetId) : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-full max-h-full overflow-auto">
        <img
          src={mockupUrl}
          alt={`Mockup ${config?.label || "produs"}`}
          className="max-w-full h-auto rounded-lg shadow-xl"
        />
      </div>
      {config && (
        <p className="mt-4 text-sm text-muted font-medium">
          Previzualizare: {config.label}
        </p>
      )}
    </div>
  );
}
