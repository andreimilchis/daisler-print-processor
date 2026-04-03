import sharp from 'sharp';
import { getReplicateClient, bufferToDataUri, downloadToBuffer } from './replicate-client';
import { mmToPx } from '@/lib/image/resize';

// Real-ESRGAN model on Replicate
const UPSCALE_MODEL = 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa';

/**
 * Upscales image using Real-ESRGAN if effective DPI is below target.
 * Returns the original buffer unchanged if no upscaling is needed.
 */
export async function aiUpscale(
  buffer: Buffer,
  targetWidthMm: number,
  targetHeightMm: number,
  targetDpi: number
): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const currentW = meta.width ?? 0;
  const currentH = meta.height ?? 0;

  const neededW = mmToPx(targetWidthMm, targetDpi);
  const neededH = mmToPx(targetHeightMm, targetDpi);

  // Calculate scale factor needed
  const scaleW = neededW / currentW;
  const scaleH = neededH / currentH;
  const scale = Math.max(scaleW, scaleH);

  // Only upscale if we need at least 1.3× more resolution
  if (scale < 1.3) {
    return buffer;
  }

  // Real-ESRGAN supports scale 2 or 4
  const upscaleFactor = scale <= 2.5 ? 2 : 4;

  const replicate = getReplicateClient();
  const dataUri = bufferToDataUri(buffer, 'image/png');

  const output = await replicate.run(UPSCALE_MODEL, {
    input: {
      image: dataUri,
      scale: upscaleFactor,
      face_enhance: false,
    },
  });

  // Output can be a URL string or ReadableStream
  let resultBuffer: Buffer;
  if (typeof output === 'string') {
    resultBuffer = await downloadToBuffer(output);
  } else if (output && typeof (output as { url?: () => Promise<URL> }).url === 'function') {
    const url = await (output as { url: () => Promise<URL> }).url();
    resultBuffer = await downloadToBuffer(url.toString());
  } else {
    throw new Error('Format neașteptat de răspuns de la modelul AI de upscale.');
  }

  return resultBuffer;
}
