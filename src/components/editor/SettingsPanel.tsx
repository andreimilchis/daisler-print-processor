"use client";

import { useEditor } from "@/lib/editor-context";
import { Unit } from "@/types";
import RecipeSelector from "./RecipeSelector";
import DpiWarning from "./DpiWarning";
import AiSettings from "./AiSettings";
import CutContourSettings from "./CutContourSettings";
import BackgroundRemoveToggle from "./BackgroundRemoveToggle";
import ProcessButton from "./ProcessButton";

const UNITS: { value: Unit; label: string }[] = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "px", label: "px" },
];

export default function SettingsPanel() {
  const { params, updateParams, cropMode, setCropMode } = useEditor();

  return (
    <aside className="w-full md:w-80 h-full bg-card border-r border-border p-5 flex flex-col gap-6 overflow-y-auto">
      <h2 className="font-bold text-lg text-foreground">Parametri</h2>

      {/* Unitate */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          Unitate
        </label>
        <div className="flex bg-background rounded-xl p-1 gap-1">
          {UNITS.map((u) => (
            <button
              key={u.value}
              onClick={() => updateParams({ unit: u.value })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                params.unit === u.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom dimensions - always visible */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          Dimensiuni ({params.unit})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="Lățime"
            value={params.targetWidthMm || ""}
            onChange={(e) => updateParams({ targetWidthMm: Number(e.target.value), presetId: undefined })}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
          <span className="text-muted self-center">×</span>
          <input
            type="number"
            min={1}
            placeholder="Înălțime"
            value={params.targetHeightMm || ""}
            onChange={(e) => updateParams({ targetHeightMm: Number(e.target.value), presetId: undefined })}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* DPI - complet custom, fără limite */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          DPI
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={params.dpi}
            onChange={(e) => updateParams({ dpi: Math.max(1, Number(e.target.value)) })}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => updateParams({ dpi: 150 })}
            className={`px-3 py-2 text-xs rounded-xl cursor-pointer ${
              params.dpi === 150 ? "bg-primary text-white" : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            150
          </button>
          <button
            onClick={() => updateParams({ dpi: 300 })}
            className={`px-3 py-2 text-xs rounded-xl cursor-pointer ${
              params.dpi === 300 ? "bg-primary text-white" : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            300
          </button>
        </div>
      </div>

      {/* Bleed - complet custom */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          Bleed (mm)
        </label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={params.bleedMm}
          onChange={(e) => updateParams({ bleedMm: Math.max(0, Number(e.target.value)) })}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted mt-1">Extensie mirror, egal pe toate laturile</p>
      </div>

      {/* Safe Margin - nou */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          Safe Margin (mm)
        </label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={params.safeMarginMm}
          onChange={(e) => updateParams({ safeMarginMm: Math.max(0, Number(e.target.value)) })}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted mt-1">Zona sigură interior, egal pe toate laturile</p>
      </div>

      {/* Trim Marks toggle */}
      <div
        onClick={() => updateParams({ showTrimMarks: !params.showTrimMarks })}
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
          params.showTrimMarks
            ? "border-gray-400 bg-gray-50"
            : "border-border hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sm text-foreground">Linii de tăiere (Trim Marks)</span>
            <p className="text-xs text-muted mt-0.5">Linii ghid la colțuri pentru tăiere</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${
            params.showTrimMarks ? "bg-gray-600" : "bg-gray-300"
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
              params.showTrimMarks ? "translate-x-[18px]" : "translate-x-0.5"
            }`} />
          </div>
        </div>
      </div>

      {/* Rețete rapide */}
      <RecipeSelector />

      {/* DPI Warning */}
      <DpiWarning />

      {/* Secțiune Avansate - colapsabilă */}
      <details className="group">
        <summary className="text-xs font-semibold text-muted uppercase tracking-wide cursor-pointer flex items-center gap-2">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 6l4 4 4-4" />
          </svg>
          Funcții avansate
        </summary>
        <div className="mt-3 flex flex-col gap-4">
          {/* AI Features */}
          <AiSettings />

          {/* Background Remove */}
          <BackgroundRemoveToggle />

          {/* CutContour */}
          <CutContourSettings />

          {/* Crop toggle */}
          <div>
            <button
              onClick={() => setCropMode(!cropMode)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                cropMode
                  ? "bg-orange-100 border-2 border-orange-400 text-orange-700"
                  : "bg-background border-2 border-border text-foreground hover:border-primary/30"
              }`}
            >
              {cropMode ? "Crop activ — click pentru a dezactiva" : "Activează Crop"}
            </button>
          </div>
        </div>
      </details>

      {/* Process */}
      <div className="mt-auto">
        <ProcessButton />
      </div>
    </aside>
  );
}
