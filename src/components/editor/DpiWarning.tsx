"use client";

import { useEffect } from "react";
import { useEditor } from "@/lib/editor-context";
import { checkDpi } from "@/lib/processing/dpi-check";

export default function DpiWarning() {
  const { fileData, params, dpiCheck, setDpiCheck, updateParams } = useEditor();

  useEffect(() => {
    if (fileData && params.targetWidthMm > 0 && params.targetHeightMm > 0) {
      const result = checkDpi(
        fileData.width,
        fileData.height,
        params.targetWidthMm,
        params.targetHeightMm
      );
      setDpiCheck(result);
    } else {
      setDpiCheck(null);
    }
  }, [fileData, params.targetWidthMm, params.targetHeightMm, setDpiCheck]);

  if (!dpiCheck || dpiCheck.effectiveDpi === 0) return null;

  const colors = {
    good: "bg-green-50 border-green-300 text-green-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    bad: "bg-red-50 border-red-300 text-red-800",
  };

  const icons = {
    good: "✓",
    warning: "⚠",
    bad: "✕",
  };

  return (
    <div className={`p-3 rounded-xl border text-sm ${colors[dpiCheck.level]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{icons[dpiCheck.level]}</span>
        <div className="flex-1">
          <p className="font-medium">DPI: {dpiCheck.effectiveDpi}</p>
          <p className="text-xs mt-0.5 opacity-80">{dpiCheck.recommendation}</p>
          {dpiCheck.level !== "good" && !params.enableAiUpscaling && (
            <button
              onClick={() => updateParams({ enableAiUpscaling: true, aiUpscaleScale: dpiCheck.effectiveDpi < 150 ? 4 : 2 })}
              className="mt-2 text-xs font-medium underline cursor-pointer hover:no-underline"
            >
              Activează AI Upscaling
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
