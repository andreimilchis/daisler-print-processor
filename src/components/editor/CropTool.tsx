"use client";

import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useEditor } from "@/lib/editor-context";

export default function CropTool() {
  const { fileData, params, setCropArea } = useEditor();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  if (!fileData?.previewUrl) return null;

  const aspect =
    params.targetWidthMm > 0 && params.targetHeightMm > 0
      ? params.targetWidthMm / params.targetHeightMm
      : undefined;

  const onComplete = (c: PixelCrop) => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const scaleX = fileData.width / img.naturalWidth;
    const scaleY = fileData.height / img.naturalHeight;

    if (c.width > 0 && c.height > 0) {
      setCropArea({
        x: Math.round(c.x * scaleX),
        y: Math.round(c.y * scaleY),
        width: Math.round(c.width * scaleX),
        height: Math.round(c.height * scaleY),
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-card rounded-xl p-2 shadow-md">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={onComplete}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            src={fileData.previewUrl}
            alt="Crop"
            className="max-h-[65vh] max-w-full"
          />
        </ReactCrop>
      </div>
      <p className="text-xs text-muted">
        {aspect
          ? `Aspect ratio fixat: ${params.targetWidthMm}:${params.targetHeightMm}`
          : "Crop liber — selectează un format pentru aspect ratio fix"}
      </p>
    </div>
  );
}
