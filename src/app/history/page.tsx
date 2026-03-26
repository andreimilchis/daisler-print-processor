"use client";

import { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  params: { targetWidthMm?: number; targetHeightMm?: number; dpi?: number } | null;
  status: string;
  processing_time_ms: number | null;
  created_at: string;
  previews?: { share_token: string; status: string; client_comment: string | null } | null;
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprobat", color: "bg-green-100 text-green-700" },
  rejected: { label: "Respins", color: "bg-red-100 text-red-700" },
  pending: { label: "În așteptare", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Procesat", color: "bg-gray-100 text-gray-600" },
  error: { label: "Eroare", color: "bg-red-100 text-red-700" },
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Istoric fișiere</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Niciun fișier procesat încă</p>
            <p className="text-muted text-sm mt-1">Procesează un fișier și va apărea aici</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 px-5 py-3 bg-background text-xs font-semibold text-muted uppercase tracking-wide border-b border-border">
              <span>Fișier</span>
              <span>Format</span>
              <span>Data</span>
              <span>Status</span>
              <span>Preview</span>
            </div>

            {/* Rows */}
            {entries.map((entry) => {
              const previewStatus = entry.previews?.status || entry.status;
              const badge = STATUS_BADGES[previewStatus] || STATUS_BADGES.completed;

              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-2 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-background/50 transition-colors"
                >
                  {/* File name */}
                  <div>
                    <p className="font-medium text-sm truncate">{entry.file_name}</p>
                    <p className="text-xs text-muted">
                      {(entry.file_size / 1024 / 1024).toFixed(1)} MB
                      {entry.processing_time_ms && ` • ${(entry.processing_time_ms / 1000).toFixed(1)}s`}
                    </p>
                  </div>

                  {/* Format */}
                  <div className="text-sm text-muted">
                    {entry.params?.targetWidthMm
                      ? `${entry.params.targetWidthMm}×${entry.params.targetHeightMm}mm`
                      : "—"}
                    {entry.params?.dpi && <span className="block text-xs">{entry.params.dpi} DPI</span>}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-muted">
                    {new Date(entry.created_at).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                    {entry.previews?.client_comment && (
                      <p className="text-[10px] text-muted mt-1 italic truncate max-w-[150px]">
                        &ldquo;{entry.previews.client_comment}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Preview link */}
                  <div>
                    {entry.previews?.share_token ? (
                      <a
                        href={`/preview/${entry.previews.share_token}`}
                        target="_blank"
                        className="text-xs text-primary hover:text-primary-dark underline"
                      >
                        Deschide preview
                      </a>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
