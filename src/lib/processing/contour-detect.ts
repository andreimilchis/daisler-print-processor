import sharp from "sharp";

export interface ContourPoint {
  x: number;
  y: number;
}

/**
 * Detect the outline contour of a non-rectangular image using alpha channel.
 * Uses marching squares-like approach for better accuracy than simple edge scanning.
 *
 * Returns an array of points forming the outline, normalized to 0-1 range.
 */
export async function detectContour(
  imageBuffer: Buffer,
  samplePoints: number = 360
): Promise<ContourPoint[]> {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Build alpha mask
  const alpha = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    alpha[i] = data[i * channels + 3];
  }

  // Find center of mass of non-transparent pixels
  let cx = 0, cy = 0, count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] > 128) {
        cx += x;
        cy += y;
        count++;
      }
    }
  }

  if (count === 0) return [];

  cx /= count;
  cy /= count;

  // Ray-cast from center to find edge points at evenly spaced angles
  const points: ContourPoint[] = [];
  const maxRadius = Math.sqrt(w * w + h * h);

  for (let i = 0; i < samplePoints; i++) {
    const angle = (i / samplePoints) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // Walk outward from center until we find the last opaque pixel
    let lastOpaqueX = cx;
    let lastOpaqueY = cy;
    let foundEdge = false;

    for (let r = 0; r < maxRadius; r += 0.5) {
      const px = Math.round(cx + dx * r);
      const py = Math.round(cy + dy * r);

      if (px < 0 || px >= w || py < 0 || py >= h) break;

      if (alpha[py * w + px] > 128) {
        lastOpaqueX = px;
        lastOpaqueY = py;
        foundEdge = true;
      } else if (foundEdge) {
        // We've gone past the edge
        break;
      }
    }

    if (foundEdge) {
      points.push({
        x: lastOpaqueX / w,
        y: lastOpaqueY / h,
      });
    }
  }

  return points;
}

/**
 * Smooth a contour by averaging neighboring points
 */
export function smoothContour(points: ContourPoint[], iterations: number = 3): ContourPoint[] {
  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    const smoothed: ContourPoint[] = [];
    const n = result.length;

    for (let i = 0; i < n; i++) {
      const prev = result[(i - 1 + n) % n];
      const curr = result[i];
      const next = result[(i + 1) % n];

      smoothed.push({
        x: prev.x * 0.25 + curr.x * 0.5 + next.x * 0.25,
        y: prev.y * 0.25 + curr.y * 0.5 + next.y * 0.25,
      });
    }

    result = smoothed;
  }

  return result;
}

/**
 * Expand a contour outward by a given offset (in normalized 0-1 coordinates)
 */
export function expandContour(
  points: ContourPoint[],
  offsetX: number,
  offsetY: number
): ContourPoint[] {
  // Find centroid
  let cx = 0, cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= points.length;
  cy /= points.length;

  return points.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return p;

    // Expand outward from centroid
    const expandDist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const factor = (dist + expandDist) / dist;

    return {
      x: cx + dx * factor,
      y: cy + dy * factor,
    };
  });
}

/**
 * Generate a mirror bleed for irregular shapes by expanding the edge pixels outward.
 * Creates a bleed area that follows the contour of the image.
 */
export async function addContourBleed(
  imageBuffer: Buffer,
  bleedPx: number
): Promise<Buffer> {
  if (bleedPx <= 0) return imageBuffer;

  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width!;
  const H = meta.height!;

  const newW = W + 2 * bleedPx;
  const newH = H + 2 * bleedPx;

  // Get raw pixel data with alpha
  const { data } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Create output buffer (RGBA)
  const out = Buffer.alloc(newW * newH * 4, 0);

  // Copy original image to center of new canvas
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const srcIdx = (y * W + x) * 4;
      const dstIdx = ((y + bleedPx) * newW + (x + bleedPx)) * 4;
      out[dstIdx] = data[srcIdx];
      out[dstIdx + 1] = data[srcIdx + 1];
      out[dstIdx + 2] = data[srcIdx + 2];
      out[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  // For each empty pixel in the bleed zone, find the nearest non-transparent pixel
  // and copy its color (simple nearest-neighbor extension)
  for (let ny = 0; ny < newH; ny++) {
    for (let nx = 0; nx < newW; nx++) {
      const dstIdx = (ny * newW + nx) * 4;

      // Skip if already has content
      if (out[dstIdx + 3] > 0) continue;

      // Original coordinates
      const ox = nx - bleedPx;
      const oy = ny - bleedPx;

      // Only fill bleed zone (within bleedPx distance of original bounds)
      if (ox < -bleedPx || ox >= W + bleedPx || oy < -bleedPx || oy >= H + bleedPx) continue;

      // Search in expanding radius for nearest opaque pixel
      let bestDist = bleedPx * bleedPx + 1;
      let bestIdx = -1;

      const searchR = bleedPx + 1;
      for (let dy = -searchR; dy <= searchR; dy++) {
        for (let dx = -searchR; dx <= searchR; dx++) {
          const sx = ox + dx;
          const sy = oy + dy;
          if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;

          const srcAlpha = data[(sy * W + sx) * 4 + 3];
          if (srcAlpha <= 128) continue;

          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = (sy * W + sx) * 4;
          }
        }
      }

      if (bestIdx >= 0 && bestDist <= (bleedPx + 1) * (bleedPx + 1)) {
        out[dstIdx] = data[bestIdx];
        out[dstIdx + 1] = data[bestIdx + 1];
        out[dstIdx + 2] = data[bestIdx + 2];
        out[dstIdx + 3] = data[bestIdx + 3];
      }
    }
  }

  return sharp(out, { raw: { width: newW, height: newH, channels: 4 } })
    .png()
    .toBuffer();
}
