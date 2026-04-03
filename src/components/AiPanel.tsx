'use client';

import { useEditor } from '@/lib/editor-context';

export default function AiPanel() {
  const { fileData, params, updateParams } = useEditor();

  if (!fileData) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-violet-600 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900">AI Enhancement</h2>
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
      </div>

      <p className="text-xs text-gray-500">
        Funcții AI care îmbunătățesc automat calitatea fișierului.
        Necesită <code className="bg-gray-100 px-1 rounded">REPLICATE_API_TOKEN</code>.
      </p>

      {/* AI Upscale */}
      <div className="space-y-1.5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={params.useAiUpscale}
            onChange={e => updateParams({ useAiUpscale: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
              AI Upscale
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Mărește rezoluția cu Real-ESRGAN (2× sau 4×) când DPI-ul e insuficient.
              Activează-l dacă primești avertisment de DPI scăzut.
            </p>
          </div>
        </label>
      </div>

      {/* AI Bleed Fill */}
      <div className="space-y-1.5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={params.useAiBleed}
            onChange={e => updateParams({ useAiBleed: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
              AI Bleed Fill
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Generează bleed-ul prin AI (Stable Diffusion inpainting) în loc de oglindire.
              Recomandat pentru fotografii cu fundal complex. Fallback automat la mirror dacă AI-ul eșuează.
            </p>
          </div>
        </label>
      </div>

      {(params.useAiUpscale || params.useAiBleed) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Notă:</strong> Procesarea AI poate dura 30–90 de secunde per imagine.
            Asigură-te că ai configurat <code className="bg-amber-100 px-1 rounded">REPLICATE_API_TOKEN</code> în <code className="bg-amber-100 px-1 rounded">.env.local</code>.
          </p>
        </div>
      )}
    </div>
  );
}
