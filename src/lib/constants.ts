import { FormatPreset, ProcessingParams, ImpositionParams, SheetPreset } from '@/types';

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    name: 'business-card',
    label: 'Carte de vizită (90×50mm)',
    width: 90,
    height: 50,
    dpi: 300,
    bleed: 3,
    safeMargin: 5,
  },
  {
    name: 'flyer-a5',
    label: 'Flyer A5 (148×210mm)',
    width: 148,
    height: 210,
    dpi: 300,
    bleed: 3,
    safeMargin: 5,
  },
  {
    name: 'flyer-a4',
    label: 'Flyer A4 (210×297mm)',
    width: 210,
    height: 297,
    dpi: 300,
    bleed: 3,
    safeMargin: 5,
  },
  {
    name: 'poster-a3',
    label: 'Poster A3 (297×420mm)',
    width: 297,
    height: 420,
    dpi: 300,
    bleed: 3,
    safeMargin: 5,
  },
  {
    name: 'banner-1x2',
    label: 'Banner 1m×2m (1000×2000mm)',
    width: 1000,
    height: 2000,
    dpi: 150,
    bleed: 0,
    safeMargin: 0,
  },
  {
    name: 'banner-2x3',
    label: 'Banner 2m×3m (2000×3000mm)',
    width: 2000,
    height: 3000,
    dpi: 150,
    bleed: 0,
    safeMargin: 0,
  },
];

export const DEFAULT_PARAMS: ProcessingParams = {
  width: 90,
  height: 50,
  dpi: 300,
  bleed: 3,
  safeMargin: 5,
  cutContour: false,
  useAiBleed: false,
  useAiUpscale: false,
};

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const SHEET_PRESETS: SheetPreset[] = [
  { id: 'a4',        label: 'A4 (210×297mm)',    width: 210,  height: 297  },
  { id: 'a3',        label: 'A3 (297×420mm)',    width: 297,  height: 420  },
  { id: 'sra3',      label: 'SRA3 (320×450mm)',  width: 320,  height: 450  },
  { id: 'b3',        label: 'B3 (353×500mm)',    width: 353,  height: 500  },
  { id: '70x100',    label: '70×100 cm',         width: 700,  height: 1000 },
  { id: 'custom',    label: 'Custom',            width: 297,  height: 420  },
];

export const DEFAULT_IMPOSITION: ImpositionParams = {
  enabled: false,
  sheetWidth: 297,
  sheetHeight: 420,
  mode: 'auto',
  rows: 2,
  cols: 2,
  spacing: 6, // 2 × default bleed (3mm)
};
