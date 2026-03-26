"use client";

import { useEditor } from "@/lib/editor-context";

const STEPS = [
  { key: "removeBg", label: "Fundal", aiStep: true },
  { key: "crop", label: "Crop", aiStep: false },
  { key: "aiFill", label: "AI Fill", aiStep: true },
  { key: "resize", label: "Resize", aiStep: false },
  { key: "upscale", label: "Upscale", aiStep: true },
  { key: "contour", label: "Contour", aiStep: false },
  { key: "bleed", label: "Bleed", aiStep: false },
  { key: "cmyk", label: "CMYK", aiStep: false },
  { key: "pdf", label: "PDF", aiStep: false },
];

export default function ProgressBar() {
  const { processing, aiProgress, params } = useEditor();

  if (!processing) return null;

  // Filter steps based on active params
  const activeSteps = STEPS.filter((s) => {
    if (s.key === "removeBg" && !params.removeBg) return false;
    if (s.key === "aiFill" && !params.enableAiFill) return false;
    if (s.key === "upscale" && !params.enableAiUpscaling) return false;
    if (s.key === "contour" && !params.cutContourEnabled) return false;
    return true;
  });

  // Guess current step from aiProgress text
  const currentLabel = aiProgress || "Se procesează...";
  let currentIdx = -1;
  for (let i = 0; i < activeSteps.length; i++) {
    if (currentLabel.toLowerCase().includes(activeSteps[i].label.toLowerCase())) {
      currentIdx = i;
      break;
    }
  }
  if (currentIdx === -1) currentIdx = 0;

  const progress = activeSteps.length > 1
    ? Math.round(((currentIdx + 0.5) / activeSteps.length) * 100)
    : 50;

  return (
    <div className="w-full px-1">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between text-[9px] text-muted">
        {activeSteps.map((step, i) => (
          <span
            key={step.key}
            className={`transition-colors ${
              i < currentIdx
                ? "text-primary font-medium"
                : i === currentIdx
                ? "text-foreground font-semibold"
                : "text-muted"
            }`}
          >
            {i < currentIdx ? "✓" : ""} {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
