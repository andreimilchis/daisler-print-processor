'use client';

import { useEditor } from '@/lib/editor-context';

export default function ProcessButton() {
  const { fileData, isProcessing, processFile } = useEditor();

  if (!fileData) return null;

  return (
    <button
      onClick={processFile}
      disabled={isProcessing}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Se procesează...
        </span>
      ) : (
        'Procesează fișierul'
      )}
    </button>
  );
}
