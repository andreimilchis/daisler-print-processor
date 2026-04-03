'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/editor-context';

export default function ExportButton() {
  const { fileData, params, processResult } = useEditor();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Only show after processing
  if (!processResult || !fileData) return null;

  const handleExport = async () => {
    if (!fileData) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append(
        'params',
        JSON.stringify({
          width: params.width,
          height: params.height,
          dpi: params.dpi,
          bleed: params.bleed,
          cutContour: params.cutContour,
          filename: fileData.name,
        })
      );

      const res = await fetch('/api/export', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json();
        setExportError(data.error ?? 'Eroare la generarea PDF-ului.');
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const baseName = fileData.name.replace(/\.[^/.]+$/, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_print_ready.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Nu s-a putut genera PDF-ul. Încearcă din nou.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Se generează PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descarcă PDF
          </>
        )}
      </button>
      {exportError && (
        <p className="text-sm text-red-600 text-center">{exportError}</p>
      )}
    </div>
  );
}
