'use client';

import { useEditor } from '@/lib/editor-context';
import { FORMAT_PRESETS } from '@/lib/constants';

export default function FormatPresets() {
  const { selectedPreset, applyPreset } = useEditor();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Preset format
      </label>
      <select
        value={selectedPreset}
        onChange={(e) => applyPreset(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {FORMAT_PRESETS.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.label}
          </option>
        ))}
        <option value="custom">Custom</option>
      </select>
    </div>
  );
}
