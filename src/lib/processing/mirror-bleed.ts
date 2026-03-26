import sharp from "sharp";
import { mmToPx } from "@/lib/units";

export async function addMirrorBleed(
  buffer: Buffer,
  bleedMm: number,
  dpi: number
): Promise<Buffer> {
  if (bleedMm <= 0) return buffer;

  const bleedPx = mmToPx(bleedMm, dpi);
  const meta = await sharp(buffer).metadata();
  const W = meta.width!;
  const H = meta.height!;
  const channels = (meta.channels || 3) as 3 | 4;

  const newW = W + 2 * bleedPx;
  const newH = H + 2 * bleedPx;

  // Extract edge strips and flip them
  const [topStrip, bottomStrip, leftStrip, rightStrip] = await Promise.all([
    // Top: first bleedPx rows, flipped vertically
    sharp(buffer).extract({ left: 0, top: 0, width: W, height: Math.min(bleedPx, H) }).flip().toBuffer(),
    // Bottom: last bleedPx rows, flipped vertically
    sharp(buffer).extract({ left: 0, top: Math.max(0, H - bleedPx), width: W, height: Math.min(bleedPx, H) }).flip().toBuffer(),
    // Left: first bleedPx cols, flipped horizontally
    sharp(buffer).extract({ left: 0, top: 0, width: Math.min(bleedPx, W), height: H }).flop().toBuffer(),
    // Right: last bleedPx cols, flipped horizontally
    sharp(buffer).extract({ left: Math.max(0, W - bleedPx), top: 0, width: Math.min(bleedPx, W), height: H }).flop().toBuffer(),
  ]);

  // Corners: extract corner region and flip both axes
  const [tlCorner, trCorner, blCorner, brCorner] = await Promise.all([
    sharp(buffer).extract({ left: 0, top: 0, width: Math.min(bleedPx, W), height: Math.min(bleedPx, H) }).flip().flop().toBuffer(),
    sharp(buffer).extract({ left: Math.max(0, W - bleedPx), top: 0, width: Math.min(bleedPx, W), height: Math.min(bleedPx, H) }).flip().flop().toBuffer(),
    sharp(buffer).extract({ left: 0, top: Math.max(0, H - bleedPx), width: Math.min(bleedPx, W), height: Math.min(bleedPx, H) }).flip().flop().toBuffer(),
    sharp(buffer).extract({ left: Math.max(0, W - bleedPx), top: Math.max(0, H - bleedPx), width: Math.min(bleedPx, W), height: Math.min(bleedPx, H) }).flip().flop().toBuffer(),
  ]);

  // Composite everything onto a new canvas
  return sharp({
    create: {
      width: newW,
      height: newH,
      channels,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      // Original image centered
      { input: buffer, left: bleedPx, top: bleedPx },
      // Edge strips
      { input: topStrip, left: bleedPx, top: 0 },
      { input: bottomStrip, left: bleedPx, top: bleedPx + H },
      { input: leftStrip, left: 0, top: bleedPx },
      { input: rightStrip, left: bleedPx + W, top: bleedPx },
      // Corners
      { input: tlCorner, left: 0, top: 0 },
      { input: trCorner, left: bleedPx + W, top: 0 },
      { input: blCorner, left: 0, top: bleedPx + H },
      { input: brCorner, left: bleedPx + W, top: bleedPx + H },
    ])
    .png()
    .toBuffer();
}
