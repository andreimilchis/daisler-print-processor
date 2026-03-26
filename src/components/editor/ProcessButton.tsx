"use client";

import { useEditor } from "@/lib/editor-context";
import ProgressBar from "./ProgressBar";

export default function ProcessButton() {
  const {
    fileData,
    params,
    cropArea,
    processing,
    pdfUrl,
    error,
    aiProgress,
    setProcessing,
    setPdfUrl,
    setError,
    setAiProgress,
    reset,
  } = useEditor();

  const canProcess = fileData && params.targetWidthMm > 0 && params.targetHeightMm > 0 && params.dpi >= 72;

  const handleProcess = async () => {
    if (!fileData || !canProcess) return;

    setProcessing(true);
    setError(null);

    const hasAi = params.enableAiFill || params.enableAiUpscaling || params.removeBg;
    if (hasAi) setAiProgress("Pregătire...");

    try {
      // Simulate step progress for AI operations
      if (params.removeBg) setAiProgress("Eliminare fundal...");

      const formData = new FormData();
      formData.append("file", fileData.file);
      formData.append(
        "params",
        JSON.stringify({
          targetWidthMm: params.targetWidthMm,
          targetHeightMm: params.targetHeightMm,
          dpi: params.dpi,
          bleedMm: params.bleedMm,
          crop: cropArea || undefined,
          enableAiFill: params.enableAiFill,
          aiOverlapPercent: params.aiOverlapPercent,
          enableAiUpscaling: params.enableAiUpscaling,
          aiUpscaleScale: params.aiUpscaleScale,
          cutContourEnabled: params.cutContourEnabled,
          cutContourType: params.cutContourType,
          cutContourOffsetMm: params.cutContourOffsetMm,
          removeBg: params.removeBg,
        })
      );

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Eroare server" }));
        throw new Error(data.error || "Eroare la procesare");
      }

      setAiProgress("Finalizare PDF...");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setProcessing(false);
      setAiProgress(null);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !fileData) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileData.name.replace(/\.[^.]+$/, "") + "_print.pdf";
    a.click();
  };

  if (pdfUrl) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descarcă PDF
        </button>
        <button
          onClick={() => setPdfUrl(null)}
          className="w-full py-2 px-4 bg-background border border-border text-foreground text-sm rounded-xl hover:bg-primary/5 cursor-pointer"
        >
          Procesează din nou
        </button>
        <button
          onClick={reset}
          className="w-full py-2 px-4 text-muted text-sm hover:text-foreground cursor-pointer"
        >
          Fișier nou
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleProcess}
        disabled={!canProcess || processing}
        className={`w-full py-3 px-4 font-medium rounded-xl transition-all cursor-pointer ${
          canProcess && !processing
            ? "bg-primary hover:bg-primary-dark text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {aiProgress || "Se procesează..."}
          </span>
        ) : (
          "Generează PDF"
        )}
      </button>

      {/* Progress bar during processing */}
      {processing && <ProgressBar />}

      {!canProcess && !processing && (
        <p className="text-xs text-muted text-center">
          Selectează un format sau o rețetă
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium mb-0.5">Eroare procesare</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
