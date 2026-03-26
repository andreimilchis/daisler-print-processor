"use client";

import { useEditor } from "@/lib/editor-context";

export default function BackgroundRemoveToggle() {
  const { params, updateParams } = useEditor();

  return (
    <div
      onClick={() => updateParams({ removeBg: !params.removeBg })}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
        params.removeBg
          ? "border-purple-400 bg-purple-50"
          : "border-border hover:border-purple-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-sm text-foreground">Elimină fundal</span>
          <p className="text-xs text-muted mt-0.5">Recomandat: tricouri, stickere</p>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors ${
          params.removeBg ? "bg-purple-500" : "bg-gray-300"
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
            params.removeBg ? "translate-x-[18px]" : "translate-x-0.5"
          }`} />
        </div>
      </div>
    </div>
  );
}
