import sharp from 'sharp';

export async function convertToCmykJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .toColorspace('cmyk')
    .jpeg({ quality: 95 })
    .toBuffer();
}
