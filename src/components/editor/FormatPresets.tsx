"use client";

import { FORMAT_PRESETS } from "@/lib/constants";
import { useEditor } from "@/lib/editor-context";

export default function FormatPresets() {
  const { params, updateParams } = useEditor();

  const selectPreset = (presetId: string) => {
    const preset = FORMAT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    updateParams({
      presetId: preset.id,
      targetWidthMm: preset.widthMm,
      targetHeightMm: preset.heightMm,
      bleedMm: preset.defaultBleedMm,
      dpi: preset.defaultDpi,
    });
  };

  const swapOrientation = () => {
    updateParams({
      targetWidthMm: params.targetHeightMm,
      targetHeightMm: params.targetWidthMm,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">
          Format
        </label>
        {params.targetWidthMm > 0 && (
          <button
            onClick={swapOrientation}
            className="text-xs text-primary hover:text-primary-dark cursor-pointer"
          >
            Rotește
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FORMAT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => selectPreset(preset.id)}
            className={`
              p-3 rounded-xl text-left text-sm transition-all cursor-pointer
              ${
                params.presetId === preset.id
                  ? "bg-primary/15 border-2 border-primary text-foreground"
                  : "bg-background border-2 border-transparent hover:border-primary/30 text-foreground"
              }
            `}
          >
            <span className="font-medium block">{preset.name}</span>
            <span className="text-xs text-muted">
              {preset.widthMm}×{preset.heightMm}mm
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
