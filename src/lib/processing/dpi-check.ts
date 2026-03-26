export interface DpiCheckResult {
  effectiveDpiW: number;
  effectiveDpiH: number;
  effectiveDpi: number;
  level: "good" | "warning" | "bad";
  recommendation: string;
}

const MM_PER_INCH = 25.4;

export function checkDpi(
  imageWidthPx: number,
  imageHeightPx: number,
  targetWidthMm: number,
  targetHeightMm: number
): DpiCheckResult {
  if (targetWidthMm <= 0 || targetHeightMm <= 0) {
    return {
      effectiveDpiW: 0,
      effectiveDpiH: 0,
      effectiveDpi: 0,
      level: "good",
      recommendation: "",
    };
  }

  const effectiveDpiW = Math.round(imageWidthPx / (targetWidthMm / MM_PER_INCH));
  const effectiveDpiH = Math.round(imageHeightPx / (targetHeightMm / MM_PER_INCH));
  const effectiveDpi = Math.min(effectiveDpiW, effectiveDpiH);

  let level: DpiCheckResult["level"];
  let recommendation: string;

  if (effectiveDpi >= 250) {
    level = "good";
    recommendation = `${effectiveDpi} DPI — calitate bună pentru print.`;
  } else if (effectiveDpi >= 150) {
    level = "warning";
    recommendation = `${effectiveDpi} DPI — calitate acceptabilă, dar sub 300 DPI. Activează AI Upscaling pentru rezultat mai bun.`;
  } else {
    level = "bad";
    recommendation = `${effectiveDpi} DPI — rezoluție prea mică pentru print de calitate. Recomandăm AI Upscaling.`;
  }

  return { effectiveDpiW, effectiveDpiH, effectiveDpi, level, recommendation };
}
