'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/editor-context';
import { SHEET_PRESETS } from '@/lib/constants';
import { calcLayout } from '@/lib/pdf/imposition';

export default function ImpositionPanel() {
  const { fileData, params, impositionParams, updateImposition } = useEditor();
  const [selectedSheet, setSelectedSheet] = useState('a3');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!fileData) return null;

  // Live layout preview calculation
  let layoutPreview: { cols: number; rows: number; count: number; rotated: boolean } | null = null;
  let layoutError: string | null = null;
  try {
    layoutPreview = calcLayout(params.width, params.height, params.bleed, {
      sheetWidthMm: impositionParams.sheetWidth,
      sheetHeightMm: impositionParams.sheetHeight,
      spacingMm: impositionParams.spacing,
      mode: impositionParams.mode,
      manualRows: impositionParams.rows,
      manualCols: impositionParams.cols,
    });
    if (layoutPreview.count === 0) {
      layoutError = `Elementul (${(params.width + 2 * params.bleed).toFixed(0)}×${(params.height + 2 * params.bleed).toFixed(0)}mm) nu încape pe coala selectată.`;
      layoutPreview = null;
    }
  } catch {
    layoutError = 'Nu s-a putut calcula layout-ul.';
  }

  const handleSheetChange = (id: string) => {
    setSelectedSheet(id);
    const preset = SHEET_PRESETS.find(p => p.id === id);
    if (preset && id !== 'custom') {
      updateImposition({ sheetWidth: preset.width, sheetHeight: preset.height });
    }
  };

  const handleExport = async () => {
    if (!fileData || !layoutPreview) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('params', JSON.stringify({
        width: params.width,
        height: params.height,
        dpi: params.dpi,
        bleed: params.bleed,
        filename: fileData.name,
        sheetWidth: impositionParams.sheetWidth,
        sheetHeight: impositionParams.sheetHeight,
        spacing: impositionParams.spacing,
        mode: impositionParams.mode,
        rows: impositionParams.rows,
        cols: impositionParams.cols,
      }));
      const res = await fetch('/api/impose', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setExportError(data.error ?? 'Eroare la generare.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const baseName = fileData.name.replace(/\.[^/.]+$/, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_impozare_${layoutPreview.cols}x${layoutPreview.rows}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Nu s-a putut genera PDF-ul cu impozare.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {/* Header with enable toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Multiplicare pe coală</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={impositionParams.enabled}
            onChange={e => updateImposition({ enabled: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Activează</span>
        </label>
      </div>

      {!impositionParams.enabled && (
        <p className="text-xs text-gray-400">
          Activează pentru a multiplica elementul pe o coală de hârtie.
        </p>
      )}

      {impositionParams.enabled && (
        <>
          {/* Sheet size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format coală</label>
            <select
              value={selectedSheet}
              onChange={e => handleSheetChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SHEET_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Custom sheet size */}
          {selectedSheet === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lățime coală (mm)</label>
                <input
                  type="number"
                  value={impositionParams.sheetWidth}
                  onChange={e => updateImposition({ sheetWidth: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Înălțime coală (mm)</label>
                <input
                  type="number"
                  value={impositionParams.sheetHeight}
                  onChange={e => updateImposition({ sheetHeight: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Mode: Auto / Manual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mod</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              <button
                onClick={() => updateImposition({ mode: 'auto' })}
                className={`flex-1 py-2 font-medium transition-colors ${
                  impositionParams.mode === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Automat
              </button>
              <button
                onClick={() => updateImposition({ mode: 'manual' })}
                className={`flex-1 py-2 font-medium transition-colors ${
                  impositionParams.mode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Manual
              </button>
            </div>
          </div>

          {/* Manual rows × cols */}
          {impositionParams.mode === 'manual' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Coloane</label>
                <input
                  type="number"
                  value={impositionParams.cols}
                  onChange={e => updateImposition({ cols: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rânduri</label>
                <input
                  type="number"
                  value={impositionParams.rows}
                  onChange={e => updateImposition({ rows: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distanță între elemente</label>
            <div className="relative">
              <input
                type="number"
                value={impositionParams.spacing}
                onChange={e => updateImposition({ spacing: Number(e.target.value) })}
                min={0}
                step={0.5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Implicit = 2× bleed ({params.bleed * 2}mm)</p>
          </div>

          {/* Layout preview */}
          {layoutError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{layoutError}</p>
            </div>
          )}
          {layoutPreview && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
              <p className="text-sm font-medium text-blue-800">
                {layoutPreview.count} elemente per coală
              </p>
              <p className="text-xs text-blue-600">
                {layoutPreview.cols} coloane × {layoutPreview.rows} rânduri
                {layoutPreview.rotated ? ' · rotit 90°' : ''}
              </p>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleExport}
            disabled={isExporting || !layoutPreview}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Se generează...
              </>
            ) : (
              'Descarcă PDF cu impozare'
            )}
          </button>
          {exportError && (
            <p className="text-sm text-red-600">{exportError}</p>
          )}
        </>
      )}
    </div>
  );
}
