'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/editor-context';
import { MOCKUP_CONFIGS } from '@/lib/mockup-config';

export default function MockupPanel() {
  const { fileData } = useEditor();
  const [enabled, setEnabled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(MOCKUP_CONFIGS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!fileData) return null;

  const handleGenerate = async () => {
    if (!fileData) return;
    setIsGenerating(true);
    setError(null);
    if (mockupUrl) URL.revokeObjectURL(mockupUrl);
    setMockupUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('productId', selectedProduct);

      const res = await fetch('/api/mockup', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Eroare la generarea mockup-ului.');
        return;
      }
      const blob = await res.blob();
      setMockupUrl(URL.createObjectURL(blob));
    } catch {
      setError('Nu s-a putut genera mockup-ul. Încearcă din nou.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!mockupUrl || !fileData) return;
    const baseName = fileData.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = mockupUrl;
    a.download = `${baseName}_mockup_${selectedProduct}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Mockup produs</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => {
              setEnabled(e.target.checked);
              if (!e.target.checked) {
                if (mockupUrl) URL.revokeObjectURL(mockupUrl);
                setMockupUrl(null);
                setError(null);
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Activează</span>
        </label>
      </div>

      {!enabled && (
        <p className="text-xs text-gray-400">
          Activează pentru a vedea designul aplicat pe un produs.
        </p>
      )}

      {enabled && (
        <>
          {/* Product selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produs</label>
            <select
              value={selectedProduct}
              onChange={e => {
                setSelectedProduct(e.target.value);
                if (mockupUrl) URL.revokeObjectURL(mockupUrl);
                setMockupUrl(null);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MOCKUP_CONFIGS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Se generează...
              </>
            ) : (
              'Generează mockup'
            )}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Mockup preview */}
          {mockupUrl && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mockupUrl}
                  alt="Mockup produs"
                  className="w-full object-contain"
                />
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descarcă mockup (PNG)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
