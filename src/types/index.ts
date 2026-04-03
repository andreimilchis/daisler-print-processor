export interface FileData {
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  previewUrl: string;
}

export interface FormatPreset {
  name: string;
  label: string;
  width: number;
  height: number;
  dpi: number;
  bleed: number;
  safeMargin: number;
}

export interface ProcessingParams {
  width: number;
  height: number;
  dpi: number;
  bleed: number;
  safeMargin: number;
  cutContour: boolean;
  useAiBleed: boolean;
  useAiUpscale: boolean;
}

export interface DpiCheckResult {
  effectiveDpi: number;
  level: 'good' | 'warning' | 'bad';
  message: string;
}

export interface ProcessResult {
  imageBase64: string;
  mimeType: string;
  widthPx: number;
  heightPx: number;
  dpiCheck: DpiCheckResult;
}

export interface ImpositionParams {
  enabled: boolean;
  sheetWidth: number;
  sheetHeight: number;
  mode: 'auto' | 'manual';
  rows: number;
  cols: number;
  spacing: number; // mm — default = 2 × bleed
}

export interface SheetPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface EditorState {
  fileData: FileData | null;
  params: ProcessingParams;
  selectedPreset: string;
  processResult: ProcessResult | null;
  isProcessing: boolean;
  processError: string | null;
  impositionParams: ImpositionParams;
}
