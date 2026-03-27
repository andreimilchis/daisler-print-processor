export interface MockupConfig {
  id: string;
  label: string;
  canvasWidth: number;
  canvasHeight: number;
  background: { r: number; g: number; b: number };
  // Region where the product image is placed
  imageRegion: { x: number; y: number; w: number; h: number };
  // Optional shadow offset
  shadowOffset?: { x: number; y: number };
  // Product background (white paper, colored shirt, etc.)
  productBg?: { r: number; g: number; b: number };
  productPadding?: number;
}

export const MOCKUP_CONFIGS: Record<string, MockupConfig> = {
  "carte-vizita": {
    id: "carte-vizita",
    label: "Carte de vizită",
    canvasWidth: 900,
    canvasHeight: 600,
    background: { r: 235, g: 230, b: 220 },
    imageRegion: { x: 200, y: 120, w: 500, h: 278 },
    shadowOffset: { x: 6, y: 6 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 0,
  },
  "cana": {
    id: "cana",
    label: "Cană",
    canvasWidth: 800,
    canvasHeight: 700,
    background: { r: 240, g: 240, b: 240 },
    imageRegion: { x: 180, y: 160, w: 440, h: 183 },
    shadowOffset: { x: 4, y: 8 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 30,
  },
  "a4": {
    id: "a4",
    label: "A4",
    canvasWidth: 700,
    canvasHeight: 950,
    background: { r: 220, g: 220, b: 220 },
    imageRegion: { x: 100, y: 75, w: 500, h: 707 },
    shadowOffset: { x: 8, y: 8 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 20,
  },
  "a3": {
    id: "a3",
    label: "A3",
    canvasWidth: 800,
    canvasHeight: 1000,
    background: { r: 220, g: 220, b: 220 },
    imageRegion: { x: 100, y: 75, w: 600, h: 849 },
    shadowOffset: { x: 8, y: 8 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 20,
  },
  "tricou": {
    id: "tricou",
    label: "Tricou DTF",
    canvasWidth: 800,
    canvasHeight: 900,
    background: { r: 245, g: 245, b: 245 },
    imageRegion: { x: 220, y: 250, w: 360, h: 400 },
    shadowOffset: { x: 0, y: 4 },
    productBg: { r: 30, g: 30, b: 30 },
    productPadding: 80,
  },
  "sticker": {
    id: "sticker",
    label: "Sticker",
    canvasWidth: 600,
    canvasHeight: 600,
    background: { r: 240, g: 238, b: 235 },
    imageRegion: { x: 100, y: 100, w: 400, h: 400 },
    shadowOffset: { x: 5, y: 5 },
    productPadding: 0,
  },
  "banner": {
    id: "banner",
    label: "Banner",
    canvasWidth: 1000,
    canvasHeight: 600,
    background: { r: 230, g: 230, b: 230 },
    imageRegion: { x: 150, y: 50, w: 700, h: 450 },
    shadowOffset: { x: 6, y: 6 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 10,
  },
  "flyer-a5": {
    id: "flyer-a5",
    label: "Flyer A5",
    canvasWidth: 700,
    canvasHeight: 900,
    background: { r: 225, g: 225, b: 225 },
    imageRegion: { x: 125, y: 100, w: 450, h: 636 },
    shadowOffset: { x: 6, y: 6 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 15,
  },
  "poster-a3": {
    id: "poster-a3",
    label: "Poster A3",
    canvasWidth: 800,
    canvasHeight: 1000,
    background: { r: 60, g: 60, b: 65 },
    imageRegion: { x: 120, y: 80, w: 560, h: 792 },
    shadowOffset: { x: 10, y: 10 },
    productBg: { r: 255, g: 255, b: 255 },
    productPadding: 15,
  },
};

export function getMockupConfig(presetId: string): MockupConfig | null {
  return MOCKUP_CONFIGS[presetId] || null;
}
