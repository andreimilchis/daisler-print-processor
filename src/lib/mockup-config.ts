export interface MockupConfig {
  id: string;
  label: string;
  canvasWidth: number;
  canvasHeight: number;
  background: { r: number; g: number; b: number };
  imageRegion: { x: number; y: number; w: number; h: number };
}

export const MOCKUP_CONFIGS: MockupConfig[] = [
  {
    id: 'carte-vizita',
    label: 'Carte de vizită',
    canvasWidth: 900,
    canvasHeight: 600,
    background: { r: 235, g: 230, b: 220 },
    imageRegion: { x: 200, y: 161, w: 500, h: 278 },
  },
  {
    id: 'cana',
    label: 'Cană',
    canvasWidth: 800,
    canvasHeight: 700,
    background: { r: 240, g: 240, b: 240 },
    imageRegion: { x: 180, y: 160, w: 440, h: 183 },
  },
  {
    id: 'tricou',
    label: 'Tricou',
    canvasWidth: 800,
    canvasHeight: 900,
    background: { r: 245, g: 245, b: 245 },
    imageRegion: { x: 220, y: 250, w: 360, h: 360 },
  },
  {
    id: 'banner',
    label: 'Banner',
    canvasWidth: 1000,
    canvasHeight: 600,
    background: { r: 230, g: 230, b: 230 },
    imageRegion: { x: 150, y: 50, w: 700, h: 450 },
  },
  {
    id: 'flyer-a5',
    label: 'Flyer A5',
    canvasWidth: 700,
    canvasHeight: 900,
    background: { r: 225, g: 225, b: 225 },
    imageRegion: { x: 125, y: 100, w: 450, h: 636 },
  },
  {
    id: 'poster-a3',
    label: 'Poster A3',
    canvasWidth: 800,
    canvasHeight: 1000,
    background: { r: 60, g: 60, b: 65 },
    imageRegion: { x: 120, y: 80, w: 560, h: 792 },
  },
  {
    id: 'sticker',
    label: 'Sticker',
    canvasWidth: 600,
    canvasHeight: 600,
    background: { r: 242, g: 240, b: 237 },
    imageRegion: { x: 100, y: 100, w: 400, h: 400 },
  },
];

export function getMockupConfig(id: string): MockupConfig | undefined {
  return MOCKUP_CONFIGS.find(c => c.id === id);
}
