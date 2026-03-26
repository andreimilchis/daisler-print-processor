"use client";

import { useEditor } from "@/lib/editor-context";
import { Unit } from "@/types";
import FormatPresets from "./FormatPresets";
import DpiWarning from "./DpiWarning";
import AiSettings from "./AiSettings";
import ProcessButton from "./ProcessButton";

const UNITS: { value: Unit; label: string }[] = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "px", label: "px" },
];

export default function SettingsPanel() {
  const { params, updateParams, cropMode, setCropMode } = useEditor();

  return (
    <aside className="w-80 bg-card border-r border-border p-5 flex flex-col gap-6 overflow-y-auto">
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

      {/* DPI */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          DPI
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={72}
            max={600}
            value={params.dpi}
            onChange={(e) => updateParams({ dpi: Math.max(72, Number(e.target.value)) })}
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

      {/* Bleed */}
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
          Bleed (mm)
        </label>
        <input
          type="number"
          min={0}
          max={20}
          step={0.5}
          value={params.bleedMm}
          onChange={(e) => updateParams({ bleedMm: Math.max(0, Number(e.target.value)) })}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted mt-1">Extensie mirror pe margini</p>
      </div>

      {/* Format presets */}
      <FormatPresets />

      {/* Custom dimensions */}
      {!params.presetId && (
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">
            Dimensiuni custom ({params.unit})
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
      )}

      {/* DPI Warning */}
      <DpiWarning />

      {/* AI Features */}
      <AiSettings />

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

      {/* Process */}
      <div className="mt-auto">
        <ProcessButton />
      </div>
    </aside>
  );
}
