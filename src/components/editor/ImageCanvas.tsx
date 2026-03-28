"use client";

import { useState } from "react";
import { useEditor } from "@/lib/editor-context";
import CropTool from "./CropTool";
import PdfPreview from "./PdfPreview";
import MockupPreview from "./MockupPreview";

export default function ImageCanvas() {
  const { fileData, cropMode, params, pdfUrl, mockupUrl, processing } = useEditor();
  const [activeTab, setActiveTab] = useState<"pdf" | "mockup">("mockup");

  if (!fileData) return null;

  // Show PDF/Mockup preview after processing
  if (pdfUrl) {
    const hasMockup = params.presetId != null;
    return (
      <div className="flex-1 flex flex-col">
        {/* Tab bar */}
        {hasMockup && (
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setActiveTab("mockup")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "mockup"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Previzualizare Produs
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "pdf"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              PDF Print
            </button>
          </div>
        )}
        {/* Content */}
        {activeTab === "mockup" && hasMockup ? <MockupPreview /> : <PdfPreview />}
      </div>
    );
  }

  // Processing overlay
  if (processing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="font-medium text-foreground text-lg">Se procesează...</p>
          <p className="text-muted text-sm mt-2">
            {params.enableAiUpscaling || params.enableAiFill || params.removeBg
              ? "Operațiunile AI pot dura 15-60 secunde"
              : "De obicei durează câteva secunde"}
          </p>
        </div>
      </div>
    );
  }

  if (fileData.type === "application/pdf") {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-12">
          <svg className="w-20 h-20 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          </svg>
          <p className="font-medium text-foreground text-lg">{fileData.name}</p>
          <p className="text-muted text-sm mt-1">
            {(fileData.size / 1024 / 1024).toFixed(1)} MB — PDF
          </p>
          <p className="text-muted text-xs mt-3">
            Selectează un format și apasă Generează PDF
          </p>
        </div>
      </div>
    );
  }

  if (cropMode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4 overflow-auto">
        <CropTool />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-4 md:p-6 overflow-auto">
      <div className="relative inline-block">
        <img
          src={fileData.previewUrl}
          alt={fileData.name}
          className="max-h-[50vh] md:max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
        />
        {/* Bleed overlay */}
        {params.bleedMm > 0 && params.targetWidthMm > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-lg" />
            <span className="absolute -top-6 left-0 text-xs text-red-500 bg-white px-2 rounded">
              bleed {params.bleedMm}mm
            </span>
          </div>
        )}
        {/* Safe Margin overlay */}
        {params.safeMarginMm > 0 && params.targetWidthMm > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[8%] border-2 border-dashed border-blue-400 rounded-lg" />
            <span className="absolute -top-6 right-0 text-xs text-blue-500 bg-white px-2 rounded">
              safe {params.safeMarginMm}mm
            </span>
          </div>
        )}
        {/* CutContour overlay */}
        {params.cutContourEnabled && params.targetWidthMm > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[-4px] border-2 border-green-500 rounded-lg"
              style={params.cutContourType === "shape" ? { borderRadius: "20%" } : {}}
            />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-600 bg-white px-2 rounded">
              CutContour {params.cutContourOffsetMm || 2}mm
            </span>
          </div>
        )}
        {/* Remove BG indicator */}
        {params.removeBg && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-lg">
            No BG
          </div>
        )}
        <div className="mt-3 text-center text-xs text-muted">
          {fileData.width} × {fileData.height} px
          {params.targetWidthMm > 0 && (
            <span className="ml-2">
              → {params.targetWidthMm} × {params.targetHeightMm} mm
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
