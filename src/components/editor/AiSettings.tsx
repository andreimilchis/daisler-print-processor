"use client";

import { useEditor } from "@/lib/editor-context";

const OVERLAP_OPTIONS = [3, 5, 10, 15];

export default function AiSettings() {
  const { params, updateParams } = useEditor();

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide block">
        AI Features
      </label>

      {/* AI Upscaling */}
      <div
        onClick={() => updateParams({ enableAiUpscaling: !params.enableAiUpscaling })}
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
          params.enableAiUpscaling
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm text-foreground">AI Upscaling</span>
            <p className="text-xs text-muted mt-0.5">Mărește rezoluția cu AI</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${
            params.enableAiUpscaling ? "bg-primary" : "bg-gray-300"
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
              params.enableAiUpscaling ? "translate-x-[18px]" : "translate-x-0.5"
            }`} />
          </div>
        </div>
        {params.enableAiUpscaling && (
          <div className="mt-3 flex gap-2">
            {([2, 4] as const).map((scale) => (
              <button
                key={scale}
                onClick={(e) => { e.stopPropagation(); updateParams({ aiUpscaleScale: scale }); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  params.aiUpscaleScale === scale
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                ×{scale}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Image Filler */}
      <div
        onClick={() => updateParams({ enableAiFill: !params.enableAiFill })}
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
          params.enableAiFill
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm text-foreground">AI Image Filler</span>
            <p className="text-xs text-muted mt-0.5">Extinde imaginea cu AI când ratio nu se potrivește</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${
            params.enableAiFill ? "bg-primary" : "bg-gray-300"
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
              params.enableAiFill ? "translate-x-[18px]" : "translate-x-0.5"
            }`} />
          </div>
        </div>
        {params.enableAiFill && (
          <div className="mt-3">
            <label className="text-xs text-muted block mb-1.5">Overlap</label>
            <div className="flex gap-1.5">
              {OVERLAP_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  onClick={(e) => { e.stopPropagation(); updateParams({ aiOverlapPercent: pct }); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    params.aiOverlapPercent === pct
                      ? "bg-primary text-white"
                      : "bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {(params.enableAiUpscaling || params.enableAiFill) && (
        <p className="text-xs text-muted text-center">
          Necesită REPLICATE_API_TOKEN configurat
        </p>
      )}
    </div>
  );
}
