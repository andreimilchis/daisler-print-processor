"use client";

import { useState, useRef, useCallback } from "react";
import { useEditor } from "@/lib/editor-context";
import { getMockupConfig } from "@/lib/mockup-config";

/** 3D mockup scenes per product type */
const SCENE_STYLES: Record<string, {
  bg: string;
  perspective: string;
  containerClass: string;
  imageTransform: string;
  shadow: string;
  label: string;
}> = {
  "cana": {
    bg: "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)",
    perspective: "800px",
    containerClass: "relative",
    imageTransform: "perspective(800px) rotateY(-15deg) rotateX(5deg)",
    shadow: "25px 25px 60px rgba(0,0,0,0.3)",
    label: "Cană",
  },
  "carte-vizita": {
    bg: "linear-gradient(135deg, #f5f0e8 0%, #e8ddd0 100%)",
    perspective: "1000px",
    containerClass: "relative",
    imageTransform: "perspective(1000px) rotateX(25deg) rotateZ(-2deg)",
    shadow: "15px 30px 50px rgba(0,0,0,0.2)",
    label: "Carte de vizită",
  },
  "tricou": {
    bg: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
    perspective: "900px",
    containerClass: "relative",
    imageTransform: "perspective(900px) rotateY(10deg) rotateX(5deg)",
    shadow: "20px 20px 50px rgba(0,0,0,0.25)",
    label: "Tricou",
  },
  "sticker": {
    bg: "linear-gradient(135deg, #f8f8f5 0%, #eeece8 100%)",
    perspective: "700px",
    containerClass: "relative",
    imageTransform: "perspective(700px) rotateX(15deg) rotateY(-8deg) rotateZ(3deg)",
    shadow: "10px 20px 40px rgba(0,0,0,0.15)",
    label: "Sticker",
  },
  "banner": {
    bg: "linear-gradient(135deg, #e5e5e5 0%, #ccc 100%)",
    perspective: "1200px",
    containerClass: "relative",
    imageTransform: "perspective(1200px) rotateY(-12deg) rotateX(3deg)",
    shadow: "30px 30px 60px rgba(0,0,0,0.25)",
    label: "Banner",
  },
  "default": {
    bg: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
    perspective: "800px",
    containerClass: "relative",
    imageTransform: "perspective(800px) rotateX(15deg) rotateY(-5deg)",
    shadow: "15px 25px 50px rgba(0,0,0,0.2)",
    label: "Produs",
  },
};

export default function MockupPreview() {
  const { mockupUrl, params, fileData } = useEditor();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const presetId = params.presetId || "default";
  const scene = SCENE_STYLES[presetId] || SCENE_STYLES["default"];
  const config = params.presetId ? getMockupConfig(params.presetId) : null;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setRotateY((prev) => prev + dx * 0.3);
      setRotateX((prev) => Math.max(-30, Math.min(30, prev - dy * 0.3)));
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastPos.current.x;
      const dy = touch.clientY - lastPos.current.y;
      setRotateY((prev) => prev + dx * 0.3);
      setRotateX((prev) => Math.max(-30, Math.min(30, prev - dy * 0.3)));
      lastPos.current = { x: touch.clientX, y: touch.clientY };
    },
    [isDragging]
  );

  if (!mockupUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f0f0]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Se generează previzualizarea...</p>
        </div>
      </div>
    );
  }

  const interactiveTransform = `perspective(${scene.perspective}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const hasInteraction = rotateX !== 0 || rotateY !== 0;

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 select-none"
      style={{ background: scene.bg }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* 3D Scene */}
      <div
        className="relative cursor-grab active:cursor-grabbing"
        style={{ perspective: scene.perspective }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          className="transition-transform duration-100"
          style={{
            transform: hasInteraction ? interactiveTransform : scene.imageTransform,
            transformStyle: "preserve-3d",
          }}
        >
          <img
            src={mockupUrl}
            alt={`Mockup ${config?.label || scene.label}`}
            className="max-w-full max-h-[60vh] h-auto rounded-lg"
            style={{
              boxShadow: scene.shadow,
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4">
        <p className="text-sm text-muted font-medium">
          {config?.label || scene.label}
          {fileData && (
            <span className="ml-2 text-xs opacity-60">
              {params.targetWidthMm}×{params.targetHeightMm}mm
            </span>
          )}
        </p>
        {hasInteraction && (
          <button
            onClick={handleReset}
            className="text-xs text-primary hover:text-primary-dark underline cursor-pointer"
          >
            Resetare
          </button>
        )}
      </div>
      <p className="text-xs text-muted mt-1 opacity-60">
        Trage pentru a roti
      </p>
    </div>
  );
}
