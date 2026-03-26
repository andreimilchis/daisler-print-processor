import sharp from "sharp";
import { mmToPx } from "@/lib/units";

export async function resizeToFormat(
  buffer: Buffer,
  targetWidthMm: number,
  targetHeightMm: number,
  dpi: number
): Promise<Buffer> {
  const widthPx = mmToPx(targetWidthMm, dpi);
  const heightPx = mmToPx(targetHeightMm, dpi);

  return sharp(buffer)
    .resize(widthPx, heightPx, { fit: "fill" })
    .toBuffer();
}
