"use client";

import { useState } from "react";
import { useEditor } from "@/lib/editor-context";

export default function ShareButton() {
  const { pdfUrl, fileData, params } = useEditor();
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pdfUrl || !fileData) return null;

  const handleShare = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert blob URL to actual blob
      const res = await fetch(pdfUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("pdf", blob, `${fileData.name.replace(/\.[^.]+$/, "")}_print.pdf`);
      formData.append("fileName", fileData.name);
      formData.append("fileSize", String(fileData.size));
      formData.append("params", JSON.stringify({
        targetWidthMm: params.targetWidthMm,
        targetHeightMm: params.targetHeightMm,
        dpi: params.dpi,
        bleedMm: params.bleedMm,
      }));

      const response = await fetch("/api/preview/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Eroare la creare link");
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.previewUrl}`;
      setShareLink(fullUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareLink) {
    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs font-medium text-blue-800 mb-2">Link de preview generat:</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareLink}
            className="flex-1 text-xs bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-blue-900 truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg cursor-pointer transition-colors"
          >
            {copied ? "Copiat!" : "Copiază"}
          </button>
        </div>
        <p className="text-[10px] text-blue-600 mt-1.5">Trimite acest link clientului pentru aprobare</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleShare}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Se generează...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Trimite clientului
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1.5 text-center">{error}</p>
      )}
    </div>
  );
}
