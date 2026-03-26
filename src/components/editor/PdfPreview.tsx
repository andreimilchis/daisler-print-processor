"use client";

import { useState } from "react";
import { useEditor } from "@/lib/editor-context";

export default function PdfPreview() {
  const { pdfUrl, fileData } = useEditor();
  const [zoom, setZoom] = useState(100);

  if (!pdfUrl) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#525659] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#3b3b3b] text-white text-sm">
        <span className="font-medium truncate max-w-[200px]">
          {fileData?.name.replace(/\.[^.]+$/, "")}_print.pdf
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            -
          </button>
          <span className="text-xs w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            +
          </button>
          <button
            onClick={() => setZoom(100)}
            className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            Fit
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-auto">
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
          className="w-full h-full border-0"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
