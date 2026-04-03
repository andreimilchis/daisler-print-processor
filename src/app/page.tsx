'use client';

import { EditorProvider } from '@/lib/editor-context';
import UploadZone from '@/components/UploadZone';
import SettingsPanel from '@/components/SettingsPanel';
import ProcessButton from '@/components/ProcessButton';
import ExportButton from '@/components/ExportButton';
import CanvasPreview from '@/components/CanvasPreview';
import ImpositionPanel from '@/components/ImpositionPanel';
import MockupPanel from '@/components/MockupPanel';
import AiPanel from '@/components/AiPanel';

export default function Home() {
  return (
    <EditorProvider>
      <main className="min-h-screen">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Daisler Print Processor</h1>
              <p className="text-xs text-gray-500">Pregătire fișiere de print</p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <UploadZone />
              <CanvasPreview />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <SettingsPanel />
              <ProcessButton />
              <ExportButton />
              <AiPanel />
              <ImpositionPanel />
              <MockupPanel />
            </div>
          </div>
        </div>
      </main>
    </EditorProvider>
  );
}
