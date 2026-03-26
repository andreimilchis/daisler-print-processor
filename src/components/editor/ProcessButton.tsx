"use client";

import { useEditor } from "@/lib/editor-context";

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
    setAiProgress(params.enableAiFill || params.enableAiUpscaling ? "Pregătire..." : null);

    try {
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
          className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
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
    <div className="flex flex-col gap-2">
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
      {!canProcess && !processing && (
        <p className="text-xs text-muted text-center">
          Selectează un format pentru a genera PDF
        </p>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
