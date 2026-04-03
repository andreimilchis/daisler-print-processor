'use client';

import { useEditor } from '@/lib/editor-context';
import FormatPresets from './FormatPresets';

function NumberInput({
  label,
  value,
  unit,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          min={min}
          step={step}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const { params, updateParams, fileData } = useEditor();

  if (!fileData) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Configurare</h2>

      <FormatPresets />

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Lățime"
          value={params.width}
          unit="mm"
          onChange={(v) => updateParams({ width: v })}
          min={1}
        />
        <NumberInput
          label="Înălțime"
          value={params.height}
          unit="mm"
          onChange={(v) => updateParams({ height: v })}
          min={1}
        />
      </div>

      <NumberInput
        label="DPI"
        value={params.dpi}
        unit="dpi"
        onChange={(v) => updateParams({ dpi: v })}
        min={1}
      />

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Bleed"
          value={params.bleed}
          unit="mm"
          onChange={(v) => updateParams({ bleed: v })}
          min={0}
          step={0.5}
        />
        <NumberInput
          label="Zonă sigură"
          value={params.safeMargin}
          unit="mm"
          onChange={(v) => updateParams({ safeMargin: v })}
          min={0}
          step={0.5}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <input
          type="checkbox"
          id="cutContour"
          checked={params.cutContour}
          onChange={(e) => updateParams({ cutContour: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="cutContour" className="text-sm text-gray-700">
          Linie de tăiere (CutContour)
        </label>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Bleed și zonă sigură se aplică simetric pe toate cele 4 laturi.
        </p>
      </div>
    </div>
  );
}
