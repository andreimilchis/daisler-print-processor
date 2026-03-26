"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface PreviewData {
  id: string;
  file_name: string;
  file_size: number;
  pdf_public_url: string;
  params: { targetWidthMm?: number; targetHeightMm?: number; dpi?: number } | null;
  status: string;
  client_comment: string | null;
  created_at: string;
}

export default function PreviewPage() {
  const { token } = useParams<{ token: string }>();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/preview/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Preview inexistent");
        return res.json();
      })
      .then(setPreview)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleReview = async (status: "approved" | "rejected") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/preview/${token}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSubmitted(true);
      setPreview((p) => p ? { ...p, status } : p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-10 h-10 border-4 border-[#5AE08C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center p-8">
          <p className="text-6xl mb-4">404</p>
          <p className="text-lg text-gray-600">Acest link de preview nu există sau a expirat.</p>
        </div>
      </div>
    );
  }

  const alreadyReviewed = preview.status !== "pending";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Image src="/logo.svg" alt="Daisler" width={120} height={30} priority />
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-sm text-gray-500">Preview fișier</span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* PDF Preview */}
        <div className="flex-1 bg-[#525659] rounded-xl overflow-hidden shadow-lg min-h-[400px] lg:min-h-[600px]">
          <iframe
            src={`${preview.pdf_public_url}#toolbar=0&navpanes=0&view=FitH`}
            className="w-full h-full min-h-[400px] lg:min-h-[600px] border-0"
            title="PDF Preview"
          />
        </div>

        {/* Sidebar - info + review */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* File info */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <h2 className="font-bold text-lg text-gray-900 mb-3 truncate">{preview.file_name}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {preview.params?.targetWidthMm && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="text-gray-400 text-xs block">Dimensiuni</span>
                  <span className="font-medium">{preview.params.targetWidthMm}×{preview.params.targetHeightMm}mm</span>
                </div>
              )}
              {preview.params?.dpi && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="text-gray-400 text-xs block">DPI</span>
                  <span className="font-medium">{preview.params.dpi}</span>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-gray-400 text-xs block">Mărime</span>
                <span className="font-medium">{(preview.file_size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-gray-400 text-xs block">Data</span>
                <span className="font-medium">{new Date(preview.created_at).toLocaleDateString("ro-RO")}</span>
              </div>
            </div>
          </div>

          {/* Review form */}
          {!alreadyReviewed && !submitted ? (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Feedback</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comentariu (opțional)..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={submitting}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {submitting ? "..." : "Aprob"}
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {submitting ? "..." : "Resping"}
                </button>
              </div>
            </div>
          ) : (
            <div className={`bg-white rounded-xl p-5 shadow-sm border-2 ${
              preview.status === "approved" ? "border-green-400" : "border-red-400"
            }`}>
              <div className="text-center">
                <span className="text-4xl block mb-2">
                  {preview.status === "approved" ? "✓" : "✕"}
                </span>
                <p className="font-semibold text-lg">
                  {preview.status === "approved" ? "Aprobat" : "Respins"}
                </p>
                {preview.client_comment && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    &ldquo;{preview.client_comment}&rdquo;
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Mulțumim pentru feedback!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
