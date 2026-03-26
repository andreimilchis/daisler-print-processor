import sharp from "sharp";
import { getReplicateClient, bufferToDataUri, downloadToBuffer } from "./replicate-client";

export async function outpaintImage(
  buffer: Buffer,
  targetWidthPx: number,
  targetHeightPx: number,
  overlapPercent: number = 5
): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const srcW = meta.width!;
  const srcH = meta.height!;

  // If image already matches or exceeds target, just resize
  if (srcW >= targetWidthPx && srcH >= targetHeightPx) {
    return buffer;
  }

  // Calculate how much to extend on each side
  const overlapFactor = overlapPercent / 100;
  const overlapPxW = Math.round(srcW * overlapFactor);
  const overlapPxH = Math.round(srcH * overlapFactor);

  // Canvas dimensions (at least target size)
  const canvasW = Math.max(targetWidthPx, srcW);
  const canvasH = Math.max(targetHeightPx, srcH);

  // Center the image on the canvas
  const offsetX = Math.round((canvasW - srcW) / 2);
  const offsetY = Math.round((canvasH - srcH) / 2);

  // Create canvas with image centered
  const canvas = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 128, g: 128, b: 128 },
    },
  })
    .composite([{ input: buffer, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();

  // Create mask: white = area to generate, black = keep original
  // With gradient overlap on edges
  const maskCanvas = Buffer.alloc(canvasW * canvasH, 255); // Start all white

  for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      const inImageX = x >= offsetX && x < offsetX + srcW;
      const inImageY = y >= offsetY && y < offsetY + srcH;

      if (inImageX && inImageY) {
        // Inside original image area
        const distFromEdgeX = Math.min(x - offsetX, offsetX + srcW - 1 - x);
        const distFromEdgeY = Math.min(y - offsetY, offsetY + srcH - 1 - y);
        const distFromEdge = Math.min(distFromEdgeX, distFromEdgeY);

        const overlapPx = Math.min(overlapPxW, overlapPxH);
        if (distFromEdge < overlapPx) {
          // Gradient zone: 0 (black/keep) in center, 255 (white/generate) at edge
          const t = 1 - distFromEdge / overlapPx;
          maskCanvas[y * canvasW + x] = Math.round(t * 255);
        } else {
          maskCanvas[y * canvasW + x] = 0; // Keep original
        }
      }
      // Outside image area stays 255 (generate)
    }
  }

  const mask = await sharp(maskCanvas, {
    raw: { width: canvasW, height: canvasH, channels: 1 },
  })
    .png()
    .toBuffer();

  // Call Replicate inpainting
  const replicate = getReplicateClient();

  const output = await replicate.run(
    "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
    {
      input: {
        image: bufferToDataUri(canvas, "image/png"),
        mask: bufferToDataUri(mask, "image/png"),
        prompt: "seamless extension of the image, same style, same colors, natural continuation, high quality, print ready",
        negative_prompt: "text, watermark, logo, blurry, low quality, artifacts",
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 25,
      },
    }
  );

  // Output is array of URLs
  const urls = output as string[];
  const outputUrl = urls[0] || String(output);
  const result = await downloadToBuffer(outputUrl);

  // Resize result to exact target dimensions
  return sharp(result).resize(targetWidthPx, targetHeightPx, { fit: "fill" }).toBuffer();
}
