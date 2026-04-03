import sharp from 'sharp';

function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export async function resizeToFormat(
  buffer: Buffer,
  targetWidthMm: number,
  targetHeightMm: number,
  dpi: number
): Promise<Buffer> {
  const widthPx = mmToPx(targetWidthMm, dpi);
  const heightPx = mmToPx(targetHeightMm, dpi);

  return sharp(buffer)
    .resize(widthPx, heightPx, { fit: 'cover', position: 'centre' })
    .toBuffer();
}

export { mmToPx };
