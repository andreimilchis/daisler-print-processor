"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/lib/editor-context";
import SettingsPanel from "@/components/editor/SettingsPanel";
import ImageCanvas from "@/components/editor/ImageCanvas";

export default function EditorPage() {
  const { fileData } = useEditor();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!fileData) router.replace("/");
  }, [fileData, router]);

  if (!fileData) return null;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile toggle button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showSettings ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>

      {/* Settings panel - slides in on mobile */}
      <div
        className={`
          fixed inset-0 z-40 md:relative md:inset-auto
          transition-transform duration-300 md:transform-none
          ${showSettings ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Backdrop on mobile */}
        <div
          className={`absolute inset-0 bg-black/30 md:hidden ${showSettings ? "block" : "hidden"}`}
          onClick={() => setShowSettings(false)}
        />
        <div className="relative z-10 h-full">
          <SettingsPanel />
        </div>
      </div>

      {/* Canvas */}
      <ImageCanvas />
    </div>
  );
}
