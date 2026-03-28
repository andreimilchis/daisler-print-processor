import sharp from "sharp";
import { CropArea } from "@/types";
import { mmToPx } from "@/lib/units";
import { resizeToFormat } from "./resize";
import { addMirrorBleed } from "./mirror-bleed";
import { convertToCmykJpeg } from "./cmyk";
import { generatePdf } from "./pdf-export";
import { outpaintImage } from "@/lib/ai/outpaint";
import { upscaleImage } from "@/lib/ai/upscale";
import { removeBackground } from "@/lib/ai/remove-bg";
import { generateCutContour } from "./cut-contour";

interface PipelineParams {
  targetWidthMm: number;
  targetHeightMm: number;
  dpi: number;
  bleedMm: number;
  safeMarginMm?: number;
  showTrimMarks?: boolean;
  crop?: CropArea;
  enableAiFill?: boolean;
  aiOverlapPercent?: number;
  enableAiUpscaling?: boolean;
  aiUpscaleScale?: 2 | 4;
  cutContourEnabled?: boolean;
  cutContourType?: "rectangle" | "shape";
  cutContourOffsetMm?: number;
  removeBg?: boolean;
}

export async function processFile(
  buffer: Buffer,
  params: PipelineParams,
  filename: string
): Promise<Buffer> {
  let img = buffer;

  // Step 1: Remove background (before everything, needs original image)
  if (params.removeBg) {
    img = await removeBackground(img);
  }

  // Step 2: Crop
  if (params.crop) {
    img = await sharp(img)
      .extract({
        left: params.crop.x,
        top: params.crop.y,
        width: params.crop.width,
        height: params.crop.height,
      })
      .toBuffer();
  }

  // Step 3: AI Image Filler (outpainting) - before resize
  if (params.enableAiFill) {
    const targetWidthPx = mmToPx(params.targetWidthMm, params.dpi);
    const targetHeightPx = mmToPx(params.targetHeightMm, params.dpi);
    img = await outpaintImage(img, targetWidthPx, targetHeightPx, params.aiOverlapPercent || 5);
  }

  // Step 4: Resize to target format
  img = await resizeToFormat(img, params.targetWidthMm, params.targetHeightMm, params.dpi);

  // Step 5: AI Upscaling - after resize
  if (params.enableAiUpscaling) {
    img = await upscaleImage(img, params.aiUpscaleScale || 2);
  }

  // Step 6: Generate CutContour data (before bleed, based on trim dimensions)
  let cutContourData = undefined;
  if (params.cutContourEnabled) {
    cutContourData = await generateCutContour(
      img,
      params.targetWidthMm,
      params.targetHeightMm,
      params.bleedMm,
      {
        enabled: true,
        type: params.cutContourType || "rectangle",
        offsetMm: params.cutContourOffsetMm || 2,
      }
    );
  }

  // Step 7: Mirror bleed
  img = await addMirrorBleed(img, params.bleedMm, params.dpi);

  // Step 8: Convert to CMYK JPEG
  const cmykJpeg = await convertToCmykJpeg(img);

  // Step 9: Generate PDF (trim marks only if enabled)
  const pdf = await generatePdf(
    cmykJpeg,
    params.targetWidthMm,
    params.targetHeightMm,
    params.bleedMm,
    filename,
    cutContourData,
    {
      showTrimMarks: params.showTrimMarks ?? false,
      safeMarginMm: params.safeMarginMm,
    }
  );

  return pdf;
}

// Multi-page: process multiple files into one PDF
export async function processMultipleFiles(
  buffers: Buffer[],
  params: PipelineParams,
  filenames: string[]
): Promise<Buffer> {
  const processedImages: Buffer[] = [];

  for (let i = 0; i < buffers.length; i++) {
    let img = buffers[i];

    if (params.removeBg) {
      img = await removeBackground(img);
    }

    if (params.crop && i === 0) {
      img = await sharp(img)
        .extract({
          left: params.crop.x,
          top: params.crop.y,
          width: params.crop.width,
          height: params.crop.height,
        })
        .toBuffer();
    }

    if (params.enableAiFill) {
      const targetWidthPx = mmToPx(params.targetWidthMm, params.dpi);
      const targetHeightPx = mmToPx(params.targetHeightMm, params.dpi);
      img = await outpaintImage(img, targetWidthPx, targetHeightPx, params.aiOverlapPercent || 5);
    }

    img = await resizeToFormat(img, params.targetWidthMm, params.targetHeightMm, params.dpi);

    if (params.enableAiUpscaling) {
      img = await upscaleImage(img, params.aiUpscaleScale || 2);
    }

    img = await addMirrorBleed(img, params.bleedMm, params.dpi);
    img = await convertToCmykJpeg(img);
    processedImages.push(img);
  }

  let cutContourData = undefined;
  if (params.cutContourEnabled) {
    cutContourData = await generateCutContour(
      processedImages[0],
      params.targetWidthMm,
      params.targetHeightMm,
      params.bleedMm,
      {
        enabled: true,
        type: params.cutContourType || "rectangle",
        offsetMm: params.cutContourOffsetMm || 2,
      }
    );
  }

  const pdf = await generatePdf(
    processedImages,
    params.targetWidthMm,
    params.targetHeightMm,
    params.bleedMm,
    filenames[0] || "document",
    cutContourData,
    {
      showTrimMarks: params.showTrimMarks ?? false,
      safeMarginMm: params.safeMarginMm,
    }
  );

  return pdf;
}
