export interface FileData {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  previewUrl: string;
  file: File;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FormatPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  defaultBleedMm: number;
  defaultDpi: number;
}

export type Unit = "mm" | "cm" | "px";

export interface ProcessingParams {
  unit: Unit;
  dpi: number;
  bleedMm: number;
  targetWidthMm: number;
  targetHeightMm: number;
  crop?: CropArea;
  presetId?: string;
  enableAiFill?: boolean;
  aiOverlapPercent?: number;
  enableAiUpscaling?: boolean;
  aiUpscaleScale?: 2 | 4;
  cutContourEnabled?: boolean;
  cutContourType?: "rectangle" | "shape";
  cutContourOffsetMm?: number;
  removeBg?: boolean;
}

export interface DpiCheckResult {
  effectiveDpiW: number;
  effectiveDpiH: number;
  effectiveDpi: number;
  level: "good" | "warning" | "bad";
  recommendation: string;
}

export interface EditorState {
  fileData: FileData | null;
  params: ProcessingParams;
  cropArea?: CropArea;
  cropMode: boolean;
  processing: boolean;
  pdfUrl: string | null;
  error: string | null;
  dpiCheck: DpiCheckResult | null;
  aiProgress: string | null;
}
