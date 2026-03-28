import { ProcessingParams } from "@/types";

export interface CutContourParams {
  enabled: boolean;
  type: "rectangle" | "shape";
  offsetMm: number;
}

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  description: string;
  params: Partial<ProcessingParams>;
  cutContour?: CutContourParams;
  removeBg?: boolean;
  isCustom?: boolean;
}

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: "carte-vizita",
    name: "Carte de vizită",
    icon: "💳",
    description: "90×50mm, 300 DPI, 3mm bleed",
    params: { targetWidthMm: 90, targetHeightMm: 50, dpi: 300, bleedMm: 3, safeMarginMm: 3 },
    cutContour: { enabled: true, type: "rectangle", offsetMm: 2 },
  },
  {
    id: "sticker",
    name: "Sticker",
    icon: "🏷️",
    description: "100×100mm, CutContour pe formă, fără fundal",
    params: { targetWidthMm: 100, targetHeightMm: 100, dpi: 300, bleedMm: 2, safeMarginMm: 2 },
    cutContour: { enabled: true, type: "shape", offsetMm: 2 },
    removeBg: true,
  },
  {
    id: "tricou-dtf",
    name: "Tricou DTF",
    icon: "👕",
    description: "A3, fără fundal, CutContour pe formă",
    params: { targetWidthMm: 297, targetHeightMm: 420, dpi: 300, bleedMm: 0, safeMarginMm: 0 },
    cutContour: { enabled: true, type: "shape", offsetMm: 2 },
    removeBg: true,
  },
  {
    id: "cana",
    name: "Cană",
    icon: "☕",
    description: "230×95mm, 300 DPI, 3mm bleed",
    params: { targetWidthMm: 230, targetHeightMm: 95, dpi: 300, bleedMm: 3, safeMarginMm: 3 },
  },
  {
    id: "banner",
    name: "Banner",
    icon: "🖼️",
    description: "2000×700mm, 150 DPI",
    params: { targetWidthMm: 2000, targetHeightMm: 700, dpi: 150, bleedMm: 5, safeMarginMm: 5 },
  },
  {
    id: "flyer-a5",
    name: "Flyer A5",
    icon: "📄",
    description: "148×210mm, 300 DPI, 3mm bleed",
    params: { targetWidthMm: 148, targetHeightMm: 210, dpi: 300, bleedMm: 3, safeMarginMm: 3 },
  },
  {
    id: "poster-a3",
    name: "Poster A3",
    icon: "📐",
    description: "297×420mm, 300 DPI, 3mm bleed",
    params: { targetWidthMm: 297, targetHeightMm: 420, dpi: 300, bleedMm: 3, safeMarginMm: 3 },
  },
  {
    id: "a4",
    name: "A4",
    icon: "📃",
    description: "210×297mm, 300 DPI, 3mm bleed",
    params: { targetWidthMm: 210, targetHeightMm: 297, dpi: 300, bleedMm: 3, safeMarginMm: 3 },
  },
];

const STORAGE_KEY = "daisler-custom-recipes";

export function getCustomRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomRecipe(recipe: Recipe): void {
  const existing = getCustomRecipes();
  const updated = existing.filter((r) => r.id !== recipe.id);
  updated.push({ ...recipe, isCustom: true });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteCustomRecipe(id: string): void {
  const existing = getCustomRecipes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((r) => r.id !== id)));
}
