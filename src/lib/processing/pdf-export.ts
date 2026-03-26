import { PDFDocument, rgb } from "pdf-lib";

const MM_TO_POINTS = 2.835;
const MARK_LENGTH_MM = 5;
const MARK_OFFSET_MM = 2;

export async function generatePdf(
  imageBuffer: Buffer,
  widthMm: number,
  heightMm: number,
  bleedMm: number,
  filename: string
): Promise<Buffer> {
  const totalWidthMm = widthMm + 2 * bleedMm;
  const totalHeightMm = heightMm + 2 * bleedMm;

  // Add extra margin for trim marks
  const markMarginMm = bleedMm > 0 ? MARK_LENGTH_MM + MARK_OFFSET_MM : 0;
  const pageWidthPt = (totalWidthMm + 2 * markMarginMm) * MM_TO_POINTS;
  const pageHeightPt = (totalHeightMm + 2 * markMarginMm) * MM_TO_POINTS;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(filename);
  pdfDoc.setProducer("Daisler Print File Processor");

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Embed the image
  const image = await pdfDoc.embedJpg(imageBuffer);

  // Draw image centered on page (with mark margin offset)
  const imgX = markMarginMm * MM_TO_POINTS;
  const imgY = markMarginMm * MM_TO_POINTS;
  const imgW = totalWidthMm * MM_TO_POINTS;
  const imgH = totalHeightMm * MM_TO_POINTS;

  page.drawImage(image, { x: imgX, y: imgY, width: imgW, height: imgH });

  // Draw trim marks if there's bleed
  if (bleedMm > 0) {
    const markLen = MARK_LENGTH_MM * MM_TO_POINTS;
    const markOff = MARK_OFFSET_MM * MM_TO_POINTS;
    const bleedPt = bleedMm * MM_TO_POINTS;
    const trimColor = rgb(0, 0, 0);
    const lineWidth = 0.5;

    // Trim box coordinates (where the cut happens)
    const trimLeft = imgX + bleedPt;
    const trimRight = imgX + imgW - bleedPt;
    const trimBottom = imgY + bleedPt;
    const trimTop = imgY + imgH - bleedPt;

    // Top-left corner
    page.drawLine({ start: { x: trimLeft, y: trimTop + markOff }, end: { x: trimLeft, y: trimTop + markOff + markLen }, thickness: lineWidth, color: trimColor });
    page.drawLine({ start: { x: trimLeft - markOff - markLen, y: trimTop }, end: { x: trimLeft - markOff, y: trimTop }, thickness: lineWidth, color: trimColor });

    // Top-right corner
    page.drawLine({ start: { x: trimRight, y: trimTop + markOff }, end: { x: trimRight, y: trimTop + markOff + markLen }, thickness: lineWidth, color: trimColor });
    page.drawLine({ start: { x: trimRight + markOff, y: trimTop }, end: { x: trimRight + markOff + markLen, y: trimTop }, thickness: lineWidth, color: trimColor });

    // Bottom-left corner
    page.drawLine({ start: { x: trimLeft, y: trimBottom - markOff - markLen }, end: { x: trimLeft, y: trimBottom - markOff }, thickness: lineWidth, color: trimColor });
    page.drawLine({ start: { x: trimLeft - markOff - markLen, y: trimBottom }, end: { x: trimLeft - markOff, y: trimBottom }, thickness: lineWidth, color: trimColor });

    // Bottom-right corner
    page.drawLine({ start: { x: trimRight, y: trimBottom - markOff - markLen }, end: { x: trimRight, y: trimBottom - markOff }, thickness: lineWidth, color: trimColor });
    page.drawLine({ start: { x: trimRight + markOff, y: trimBottom }, end: { x: trimRight + markOff + markLen, y: trimBottom }, thickness: lineWidth, color: trimColor });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
