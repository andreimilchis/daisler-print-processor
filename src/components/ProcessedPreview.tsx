'use client';

import { useEditor } from '@/lib/editor-context';
import DpiWarning from './DpiWarning';

export default function ProcessedPreview() {
  const { processResult, processError, isProcessing, params } = useEditor();

  if (isProcessing) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="animate-spin w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Se procesează fișierul...</p>
        </div>
      </div>
    );
  }

  if (processError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm text-red-700">{processError}</p>
      </div>
    );
  }

  if (!processResult) return null;

  const bleedMm = params.bleed;
  const totalW = params.width + 2 * bleedMm;
  const totalH = params.height + 2 * bleedMm;

  return (
    <div className="space-y-4">
      <DpiWarning result={processResult.dpiCheck} />

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Preview procesare</span>
          <span className="text-xs text-gray-400">
            {totalW.toFixed(1)} × {totalH.toFixed(1)} mm (cu bleed) &middot;{' '}
            {processResult.widthPx} × {processResult.heightPx} px
          </span>
        </div>
        <div className="p-4 flex items-center justify-center">
          <img
            src={`data:${processResult.mimeType};base64,${processResult.imageBase64}`}
            alt="Imagine procesată"
            className="max-w-full max-h-80 object-contain rounded shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
