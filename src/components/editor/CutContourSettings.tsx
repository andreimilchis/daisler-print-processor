"use client";

import { useEditor } from "@/lib/editor-context";

const OFFSET_OPTIONS = [2, 3, 5];

export default function CutContourSettings() {
  const { params, updateParams } = useEditor();

  return (
    <div
      onClick={() => updateParams({ cutContourEnabled: !params.cutContourEnabled })}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
        params.cutContourEnabled
          ? "border-green-400 bg-green-50"
          : "border-border hover:border-green-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-sm text-foreground">CutContour</span>
          <p className="text-xs text-muted mt-0.5">Linie de tăiere verde (RGB 0,255,0)</p>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors ${
          params.cutContourEnabled ? "bg-green-500" : "bg-gray-300"
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
            params.cutContourEnabled ? "translate-x-[18px]" : "translate-x-0.5"
          }`} />
        </div>
      </div>

      {params.cutContourEnabled && (
        <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Tip contur */}
          <div>
            <label className="text-xs text-muted block mb-1.5">Tip contur</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateParams({ cutContourType: "rectangle" })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  params.cutContourType === "rectangle"
                    ? "bg-green-500 text-white"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                Dreptunghi
              </button>
              <button
                onClick={() => updateParams({ cutContourType: "shape" })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  params.cutContourType === "shape"
                    ? "bg-green-500 text-white"
                    : "bg-background text-muted hover:text-foreground"
                }`}
              >
                Pe formă
              </button>
            </div>
          </div>

          {/* Offset */}
          <div>
            <label className="text-xs text-muted block mb-1.5">Offset (mm)</label>
            <div className="flex gap-1.5">
              {OFFSET_OPTIONS.map((mm) => (
                <button
                  key={mm}
                  onClick={() => updateParams({ cutContourOffsetMm: mm })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    params.cutContourOffsetMm === mm
                      ? "bg-green-500 text-white"
                      : "bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {mm}mm
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
