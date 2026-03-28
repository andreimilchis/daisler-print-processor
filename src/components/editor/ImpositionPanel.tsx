"use client";

import { useState } from "react";
import { useEditor } from "@/lib/editor-context";
import { SHEET_PRESETS } from "@/lib/processing/imposition";

export default function ImpositionPanel() {
  const { params, pdfUrl } = useEditor();
  const [sheetPreset, setSheetPreset] = useState("sra3");
  const [customSheetW, setCustomSheetW] = useState(320);
  const [customSheetH, setCustomSheetH] = useState(450);
  const [gapMm, setGapMm] = useState(3);
  const [autoRotate, setAutoRotate] = useState(true);
  const [copies, setCopies] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    itemsPerSheet: number;
    sheetsNeeded: number;
    rotated: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Can only impose after PDF is generated
  if (!pdfUrl) return null;

  const selectedSheet = SHEET_PRESETS.find((s) => s.id === sheetPreset);
  const sheetW = sheetPreset === "custom" ? customSheetW : selectedSheet?.widthMm || 320;
  const sheetH = sheetPreset === "custom" ? customSheetH : selectedSheet?.heightMm || 450;

  // Quick preview calc: how many items fit
  const itemW = params.targetWidthMm + 2 * params.bleedMm;
  const itemH = params.targetHeightMm + 2 * params.bleedMm;
  const normalCols = Math.floor((sheetW + gapMm) / (itemW + gapMm));
  const normalRows = Math.floor((sheetH + gapMm) / (itemH + gapMm));
  const normalCount = normalCols * normalRows;
  const rotCols = Math.floor((sheetW + gapMm) / (itemH + gapMm));
  const rotRows = Math.floor((sheetH + gapMm) / (itemW + gapMm));
  const rotCount = rotCols * rotRows;
  const bestCount = autoRotate ? Math.max(normalCount, rotCount) : normalCount;

  const handleImpose = async () => {
    if (!pdfUrl) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Fetch the generated PDF blob
      const pdfBlob = await fetch(pdfUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("file", pdfBlob, "item.pdf");
      formData.append("itemWidthMm", String(params.targetWidthMm));
      formData.append("itemHeightMm", String(params.targetHeightMm));
      formData.append("bleedMm", String(params.bleedMm));
      formData.append(
        "config",
        JSON.stringify({
          sheetWidthMm: sheetW,
          sheetHeightMm: sheetH,
          gapMm,
          autoRotate,
          copies,
        })
      );

      const res = await fetch("/api/impose", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Eroare server" }));
        throw new Error(data.error || "Eroare la impozare");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setResult({
        url,
        itemsPerSheet: Number(res.headers.get("X-Items-Per-Sheet") || 0),
        sheetsNeeded: Number(res.headers.get("X-Sheets-Needed") || 1),
        rotated: res.headers.get("X-Rotated") === "true",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `impozare_${sheetW}x${sheetH}.pdf`;
    a.click();
  };

  return (
    <div className="border-t border-border pt-4 mt-2">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
        Impozare (multiplicare pe coală)
      </h3>

      {/* Sheet size */}
      <div className="mb-3">
        <label className="text-xs text-muted block mb-1.5">Dimensiune coală</label>
        <div className="flex flex-wrap gap-1.5">
          {SHEET_PRESETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSheetPreset(s.id)}
              className={`px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                sheetPreset === s.id
                  ? "bg-primary text-white"
                  : "bg-background border border-border text-muted hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            onClick={() => setSheetPreset("custom")}
            className={`px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
              sheetPreset === "custom"
                ? "bg-primary text-white"
                : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom sheet dimensions */}
      {sheetPreset === "custom" && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={1}
            value={customSheetW}
            onChange={(e) => setCustomSheetW(Number(e.target.value))}
            className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs"
            placeholder="Lățime mm"
          />
          <span className="text-muted self-center text-xs">×</span>
          <input
            type="number"
            min={1}
            value={customSheetH}
            onChange={(e) => setCustomSheetH(Number(e.target.value))}
            className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs"
            placeholder="Înălțime mm"
          />
        </div>
      )}

      {/* Gap */}
      <div className="mb-3">
        <label className="text-xs text-muted block mb-1.5">Distanță între itemi (mm)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={gapMm}
          onChange={(e) => setGapMm(Number(e.target.value))}
          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs"
        />
      </div>

      {/* Copies */}
      <div className="mb-3">
        <label className="text-xs text-muted block mb-1.5">Număr copii (0 = umple coala)</label>
        <input
          type="number"
          min={0}
          value={copies}
          onChange={(e) => setCopies(Math.max(0, Number(e.target.value)))}
          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs"
        />
      </div>

      {/* Auto rotate */}
      <div
        onClick={() => setAutoRotate(!autoRotate)}
        className="flex items-center justify-between mb-3 cursor-pointer"
      >
        <span className="text-xs text-foreground">Rotire automată (optimizare)</span>
        <div
          className={`w-9 h-5 rounded-full transition-colors ${
            autoRotate ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
              autoRotate ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>

      {/* Preview info */}
      <div className="bg-background rounded-lg p-3 mb-3 text-xs">
        <div className="flex justify-between text-muted">
          <span>Item:</span>
          <span className="font-medium text-foreground">
            {itemW.toFixed(1)} × {itemH.toFixed(1)} mm (cu bleed)
          </span>
        </div>
        <div className="flex justify-between text-muted mt-1">
          <span>Coală:</span>
          <span className="font-medium text-foreground">{sheetW} × {sheetH} mm</span>
        </div>
        <div className="flex justify-between text-muted mt-1">
          <span>Încap pe coală:</span>
          <span className="font-bold text-primary">{bestCount} buc</span>
        </div>
        {copies > 0 && (
          <div className="flex justify-between text-muted mt-1">
            <span>Coli necesare:</span>
            <span className="font-medium text-foreground">
              {Math.ceil(copies / (bestCount || 1))}
            </span>
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleImpose}
        disabled={processing || bestCount === 0}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          !processing && bestCount > 0
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Se generează...
          </span>
        ) : (
          `Generează impozare (${bestCount} buc/coală)`
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-3 space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
            <p className="font-medium text-green-700">
              {result.itemsPerSheet} itemi/coală
              {result.sheetsNeeded > 1 && ` × ${result.sheetsNeeded} coli`}
              {result.rotated && " (rotit)"}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descarcă PDF impozare
          </button>
        </div>
      )}
    </div>
  );
}
