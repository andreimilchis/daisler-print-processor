'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/editor-context';
import DpiWarning from './DpiWarning';

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function CanvasPreview() {
  const { processResult, processError, isProcessing, params } = useEditor();

  const [zoom, setZoom] = useState(1);
  const [showBleed, setShowBleed] = useState(true);
  const [showTrim, setShowTrim] = useState(true);
  const [showSafe, setShowSafe] = useState(true);

  const zoomIn = () => {
    const idx = ZOOM_STEPS.indexOf(zoom);
    if (idx < ZOOM_STEPS.length - 1) setZoom(ZOOM_STEPS[idx + 1]);
  };
  const zoomOut = () => {
    const idx = ZOOM_STEPS.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_STEPS[idx - 1]);
  };

  if (isProcessing) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 flex items-center justify-center">
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

  const { bleed, safeMargin, width, height, cutContour } = params;
  const totalW = width + 2 * bleed;
  const totalH = height + 2 * bleed;

  // Percentages of overlay lines relative to total (with-bleed) dimensions
  const bleedPct = bleed > 0 ? (bleed / totalW) * 100 : 0;
  const bleedPctH = bleed > 0 ? (bleed / totalH) * 100 : 0;
  const safePct = bleed > 0 || safeMargin > 0 ? ((bleed + safeMargin) / totalW) * 100 : 0;
  const safePctH = bleed > 0 || safeMargin > 0 ? ((bleed + safeMargin) / totalH) * 100 : 0;

  const cannotZoomIn = zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1];
  const cannotZoomOut = zoom === ZOOM_STEPS[0];

  return (
    <div className="space-y-3">
      <DpiWarning result={processResult.dpiCheck} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Zone toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBleed(v => !v)}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
              showBleed
                ? 'bg-orange-100 border-orange-300 text-orange-700'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            Bleed
          </button>
          <button
            onClick={() => setShowTrim(v => !v)}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
              showTrim
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            Linie tăiere
          </button>
          <button
            onClick={() => setShowSafe(v => !v)}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
              showSafe
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            Zonă sigură
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={cannotZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none"
          >
            −
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={cannotZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="border border-gray-200 rounded-xl bg-[#e8e8e8] overflow-auto">
        <div className="p-4 flex items-center justify-center min-h-64">
          {/* Scalable container */}
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
          >
            {/* Image + overlays wrapper — position relative so overlays sit on top */}
            <div className="relative inline-block shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${processResult.mimeType};base64,${processResult.imageBase64}`}
                alt="Imagine procesată"
                className="block max-w-[600px] max-h-[500px] object-contain"
                style={{ display: 'block' }}
              />

              {/* Bleed zone boundary — outermost box (just a faint tint on corners) */}
              {showBleed && bleed > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 2px rgba(234,88,12,0.6)`,
                    outline: '1px dashed rgba(234,88,12,0.4)',
                  }}
                />
              )}

              {/* Trim line — at bleed offset from edge */}
              {showTrim && bleed > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: `${bleedPctH}%`,
                    left: `${bleedPct}%`,
                    right: `${bleedPct}%`,
                    bottom: `${bleedPctH}%`,
                    border: '1.5px dashed rgba(37,99,235,0.85)',
                  }}
                />
              )}

              {/* Safe margin line */}
              {showSafe && safeMargin > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: `${safePctH}%`,
                    left: `${safePct}%`,
                    right: `${safePct}%`,
                    bottom: `${safePctH}%`,
                    border: '1.5px dashed rgba(22,163,74,0.85)',
                  }}
                />
              )}

              {/* Cut contour line (same position as trim for rectangle) */}
              {cutContour && showTrim && bleed > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: `${bleedPctH}%`,
                    left: `${bleedPct}%`,
                    right: `${bleedPct}%`,
                    bottom: `${bleedPctH}%`,
                    border: '1px solid rgba(220,38,38,0.9)',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-gray-200 bg-white rounded-b-xl flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-700">{totalW.toFixed(1)} × {totalH.toFixed(1)} mm</span> total (cu bleed)
          </span>
          <span>
            <span className="font-medium text-gray-700">{width} × {height} mm</span> format final
          </span>
          <span>
            <span className="font-medium text-gray-700">{processResult.widthPx} × {processResult.heightPx} px</span>
          </span>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-3">
            {showBleed && bleed > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 border-t-2 border-orange-500 border-dashed" />
                bleed
              </span>
            )}
            {showTrim && bleed > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 border-t-2 border-blue-600 border-dashed" />
                tăiere
              </span>
            )}
            {showSafe && safeMargin > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 border-t-2 border-green-600 border-dashed" />
                zonă sigură
              </span>
            )}
            {cutContour && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 border-t-2 border-red-600" />
                cut contour
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
