import sharp from 'sharp';
import { mmToPx } from './resize';

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

  const totalW = W + 2 * bleedPx;
  const totalH = H + 2 * bleedPx;

  // Extract edge strips and flip them for mirroring
  const [topStrip, bottomStrip, leftStrip, rightStrip] = await Promise.all([
    // Top: first bleedPx rows, flip vertically
    sharp(buffer)
      .extract({ left: 0, top: 0, width: W, height: bleedPx })
      .flip()
      .toBuffer(),
    // Bottom: last bleedPx rows, flip vertically
    sharp(buffer)
      .extract({ left: 0, top: H - bleedPx, width: W, height: bleedPx })
      .flip()
      .toBuffer(),
    // Left: first bleedPx columns, flip horizontally
    sharp(buffer)
      .extract({ left: 0, top: 0, width: bleedPx, height: H })
      .flop()
      .toBuffer(),
    // Right: last bleedPx columns, flip horizontally
    sharp(buffer)
      .extract({ left: W - bleedPx, top: 0, width: bleedPx, height: H })
      .flop()
      .toBuffer(),
  ]);

  // Extract corners and flip both axes (diagonal mirror)
  const [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner] =
    await Promise.all([
      sharp(buffer)
        .extract({ left: 0, top: 0, width: bleedPx, height: bleedPx })
        .flip()
        .flop()
        .toBuffer(),
      sharp(buffer)
        .extract({ left: W - bleedPx, top: 0, width: bleedPx, height: bleedPx })
        .flip()
        .flop()
        .toBuffer(),
      sharp(buffer)
        .extract({ left: 0, top: H - bleedPx, width: bleedPx, height: bleedPx })
        .flip()
        .flop()
        .toBuffer(),
      sharp(buffer)
        .extract({ left: W - bleedPx, top: H - bleedPx, width: bleedPx, height: bleedPx })
        .flip()
        .flop()
        .toBuffer(),
    ]);

  // Composite everything onto a new canvas
  const result = await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      // Corners
      { input: topLeftCorner, left: 0, top: 0 },
      { input: topRightCorner, left: bleedPx + W, top: 0 },
      { input: bottomLeftCorner, left: 0, top: bleedPx + H },
      { input: bottomRightCorner, left: bleedPx + W, top: bleedPx + H },
      // Edge strips
      { input: topStrip, left: bleedPx, top: 0 },
      { input: bottomStrip, left: bleedPx, top: bleedPx + H },
      { input: leftStrip, left: 0, top: bleedPx },
      { input: rightStrip, left: bleedPx + W, top: bleedPx },
      // Original image centered
      { input: buffer, left: bleedPx, top: bleedPx },
    ])
    .png()
    .toBuffer();

  return result;
}
