import { FormatPreset } from "@/types";

export const FORMAT_PRESETS: FormatPreset[] = [
  { id: "carte-vizita", name: "Carte de vizită", widthMm: 90, heightMm: 50, defaultBleedMm: 3, defaultDpi: 300 },
  { id: "a5", name: "A5", widthMm: 148, heightMm: 210, defaultBleedMm: 3, defaultDpi: 300 },
  { id: "a4", name: "A4", widthMm: 210, heightMm: 297, defaultBleedMm: 3, defaultDpi: 300 },
  { id: "a3", name: "A3", widthMm: 297, heightMm: 420, defaultBleedMm: 3, defaultDpi: 300 },
  { id: "sticker", name: "Sticker", widthMm: 100, heightMm: 100, defaultBleedMm: 3, defaultDpi: 300 },
  { id: "banner", name: "Banner", widthMm: 2000, heightMm: 700, defaultBleedMm: 5, defaultDpi: 150 },
  { id: "tricou", name: "Tricou", widthMm: 350, heightMm: 400, defaultBleedMm: 0, defaultDpi: 300 },
  { id: "cana", name: "Cană", widthMm: 230, heightMm: 95, defaultBleedMm: 3, defaultDpi: 300 },
];

export const DEFAULT_PARAMS = {
  unit: "mm" as const,
  dpi: 300,
  bleedMm: 3,
  targetWidthMm: 0,
  targetHeightMm: 0,
};
