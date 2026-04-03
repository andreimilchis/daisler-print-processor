import sharp from 'sharp';
import { getReplicateClient, bufferToDataUri, downloadToBuffer } from './replicate-client';
import { mmToPx } from '@/lib/image/resize';
import { addMirrorBleed } from '@/lib/image/mirror-bleed';

// SD Inpainting model on Replicate
const INPAINT_MODEL = 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3';

/**
 * Generates bleed using AI outpainting (Stable Diffusion inpainting).
 * Falls back to mirror bleed if AI fails or token is not set.
 */
export async function addAiBleed(
  buffer: Buffer,
  bleedMm: number,
  dpi: number
): Promise<Buffer> {
  if (bleedMm <= 0) return buffer;

  try {
    return await outpaintWithAi(buffer, bleedMm, dpi);
  } catch (err) {
    console.warn('AI bleed failed, falling back to mirror bleed:', err);
    return addMirrorBleed(buffer, bleedMm, dpi);
  }
}

async function outpaintWithAi(
  buffer: Buffer,
  bleedMm: number,
  dpi: number
): Promise<Buffer> {
  const bleedPx = mmToPx(bleedMm, dpi);

  const meta = await sharp(buffer).metadata();
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;

  const canvasW = imgW + bleedPx * 2;
  const canvasH = imgH + bleedPx * 2;

  // Create canvas with the original image centered (bleed zones are transparent/black)
  const canvasBuffer = await sharp({
    create: { width: canvasW, height: canvasH, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .composite([{ input: buffer, left: bleedPx, top: bleedPx }])
    .png()
    .toBuffer();

  // Mask: white = area to generate (bleed), black = area to keep (original image)
  // Build mask: all white, then paste black rectangle in image region
  const blackPatch = await sharp({
    create: { width: imgW, height: imgH, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();

  const maskBuffer = await sharp({
    create: { width: canvasW, height: canvasH, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: blackPatch, left: bleedPx, top: bleedPx }])
    .png()
    .toBuffer();

  const replicate = getReplicateClient();

  const output = await replicate.run(INPAINT_MODEL, {
    input: {
      image: bufferToDataUri(canvasBuffer, 'image/png'),
      mask: bufferToDataUri(maskBuffer, 'image/png'),
      prompt: 'seamless background extension, continue the background naturally',
      negative_prompt: 'text, watermark, logo, artifacts',
      num_inference_steps: 20,
      guidance_scale: 7.5,
    },
  });

  let resultUrl: string;
  if (typeof output === 'string') {
    resultUrl = output;
  } else if (Array.isArray(output) && typeof output[0] === 'string') {
    resultUrl = output[0] as string;
  } else if (output && typeof (output as { url?: () => Promise<URL> }).url === 'function') {
    const url = await (output as { url: () => Promise<URL> }).url();
    resultUrl = url.toString();
  } else {
    throw new Error('Format neașteptat de răspuns de la modelul AI de bleed.');
  }

  const resultBuffer = await downloadToBuffer(resultUrl);

  // Ensure output matches expected canvas size
  return sharp(resultBuffer)
    .resize(canvasW, canvasH, { fit: 'fill' })
    .png()
    .toBuffer();
}
