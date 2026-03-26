import sharp from "sharp";
import { CropArea } from "@/types";
import { mmToPx } from "@/lib/units";
import { resizeToFormat } from "./resize";
import { addMirrorBleed } from "./mirror-bleed";
import { convertToCmykJpeg } from "./cmyk";
import { generatePdf } from "./pdf-export";
import { outpaintImage } from "@/lib/ai/outpaint";
import { upscaleImage } from "@/lib/ai/upscale";

interface PipelineParams {
  targetWidthMm: number;
  targetHeightMm: number;
  dpi: number;
  bleedMm: number;
  crop?: CropArea;
  enableAiFill?: boolean;
  aiOverlapPercent?: number;
  enableAiUpscaling?: boolean;
  aiUpscaleScale?: 2 | 4;
}

export async function processFile(
  buffer: Buffer,
  params: PipelineParams,
  filename: string
): Promise<Buffer> {
  let img = buffer;

  // Step 1: Crop
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

  // Step 2: AI Image Filler (outpainting) - before resize
  if (params.enableAiFill) {
    const targetWidthPx = mmToPx(params.targetWidthMm, params.dpi);
    const targetHeightPx = mmToPx(params.targetHeightMm, params.dpi);
    img = await outpaintImage(img, targetWidthPx, targetHeightPx, params.aiOverlapPercent || 5);
  }

  // Step 3: Resize to target format
  img = await resizeToFormat(img, params.targetWidthMm, params.targetHeightMm, params.dpi);

  // Step 4: AI Upscaling - after resize
  if (params.enableAiUpscaling) {
    img = await upscaleImage(img, params.aiUpscaleScale || 2);
  }

  // Step 5: Mirror bleed
  img = await addMirrorBleed(img, params.bleedMm, params.dpi);

  // Step 6: Convert to CMYK JPEG
  const cmykJpeg = await convertToCmykJpeg(img);

  // Step 7: Generate PDF with trim marks
  const pdf = await generatePdf(
    cmykJpeg,
    params.targetWidthMm,
    params.targetHeightMm,
    params.bleedMm,
    filename
  );

  return pdf;
}
