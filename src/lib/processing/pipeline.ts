import sharp from "sharp";
import { CropArea } from "@/types";
import { resizeToFormat } from "./resize";
import { addMirrorBleed } from "./mirror-bleed";
import { convertToCmykJpeg } from "./cmyk";
import { generatePdf } from "./pdf-export";

interface PipelineParams {
  targetWidthMm: number;
  targetHeightMm: number;
  dpi: number;
  bleedMm: number;
  crop?: CropArea;
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

  // Step 2: Resize to target format
  img = await resizeToFormat(img, params.targetWidthMm, params.targetHeightMm, params.dpi);

  // Step 3: Mirror bleed
  img = await addMirrorBleed(img, params.bleedMm, params.dpi);

  // Step 4: Convert to CMYK JPEG
  const cmykJpeg = await convertToCmykJpeg(img);

  // Step 5: Generate PDF with trim marks
  const pdf = await generatePdf(
    cmykJpeg,
    params.targetWidthMm,
    params.targetHeightMm,
    params.bleedMm,
    filename
  );

  return pdf;
}
