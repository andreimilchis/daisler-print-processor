import { Unit } from "@/types";

const MM_PER_INCH = 25.4;

export function mmToPx(mm: number, dpi: number): number {
  return Math.round(mm * dpi / MM_PER_INCH);
}

export function pxToMm(px: number, dpi: number): number {
  return Math.round((px * MM_PER_INCH / dpi) * 100) / 100;
}

export function mmToCm(mm: number): number {
  return Math.round(mm / 10 * 100) / 100;
}

export function cmToMm(cm: number): number {
  return cm * 10;
}

export function convertFromMm(mm: number, unit: Unit, dpi: number): number {
  switch (unit) {
    case "mm": return Math.round(mm * 100) / 100;
    case "cm": return mmToCm(mm);
    case "px": return mmToPx(mm, dpi);
  }
}

export function convertToMm(value: number, unit: Unit, dpi: number): number {
  switch (unit) {
    case "mm": return value;
    case "cm": return cmToMm(value);
    case "px": return pxToMm(value, dpi);
  }
}

export function formatDimension(mm: number, unit: Unit, dpi: number): string {
  const val = convertFromMm(mm, unit, dpi);
  return `${val}${unit}`;
}
