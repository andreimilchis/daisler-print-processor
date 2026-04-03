export type DpiLevel = 'good' | 'warning' | 'bad';

export interface DpiCheckResult {
  effectiveDpi: number;
  level: DpiLevel;
  message: string;
}

export function checkDpi(
  imageWidthPx: number,
  imageHeightPx: number,
  targetWidthMm: number,
  targetHeightMm: number
): DpiCheckResult {
  const widthDpi = imageWidthPx / (targetWidthMm / 25.4);
  const heightDpi = imageHeightPx / (targetHeightMm / 25.4);
  const effectiveDpi = Math.round(Math.min(widthDpi, heightDpi));

  let level: DpiLevel;
  let message: string;

  if (effectiveDpi >= 250) {
    level = 'good';
    message = `${effectiveDpi} DPI — calitate bună pentru print`;
  } else if (effectiveDpi >= 150) {
    level = 'warning';
    message = `${effectiveDpi} DPI — calitate acceptabilă, dar sub 300 DPI. Imaginea poate apărea ușor neclară la print.`;
  } else {
    level = 'bad';
    message = `${effectiveDpi} DPI — rezoluție prea mică pentru print. Calitatea finală va fi slabă.`;
  }

  return { effectiveDpi, level, message };
}
