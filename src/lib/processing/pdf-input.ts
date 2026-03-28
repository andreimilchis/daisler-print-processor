import { PDFDocument } from "pdf-lib";

const MM_TO_POINTS = 2.835;

interface PdfInputParams {
  targetWidthMm: number;
  targetHeightMm: number;
  bleedMm: number;
  safeMarginMm?: number;
  showTrimMarks?: boolean;
}

/**
 * Process a PDF input file:
 * - Reads the original PDF
 * - Creates a new PDF with the target dimensions + bleed
 * - Places original content centered on each page
 * - Preserves vector elements (no rasterization)
 */
export async function processPdfInput(
  pdfBuffer: Buffer,
  params: PdfInputParams,
  filename: string
): Promise<Buffer> {
  const srcDoc = await PDFDocument.load(pdfBuffer);
  const outDoc = await PDFDocument.create();
  outDoc.setTitle(filename);
  outDoc.setProducer("Daisler Print File Processor");

  const totalWidthMm = params.targetWidthMm + 2 * params.bleedMm;
  const totalHeightMm = params.targetHeightMm + 2 * params.bleedMm;
  const pageWidthPt = totalWidthMm * MM_TO_POINTS;
  const pageHeightPt = totalHeightMm * MM_TO_POINTS;

  const bleedPt = params.bleedMm * MM_TO_POINTS;

  const srcPages = srcDoc.getPages();

  for (let i = 0; i < srcPages.length; i++) {
    // Embed the source page
    const [embeddedPage] = await outDoc.embedPdf(srcDoc, [i]);

    const newPage = outDoc.addPage([pageWidthPt, pageHeightPt]);

    // Get original page dimensions
    const srcPage = srcPages[i];
    const srcWidth = srcPage.getWidth();
    const srcHeight = srcPage.getHeight();

    // Target area (inside bleed)
    const targetWidthPt = params.targetWidthMm * MM_TO_POINTS;
    const targetHeightPt = params.targetHeightMm * MM_TO_POINTS;

    // Scale the source page to fit within target area (cover mode - fill, crop excess)
    const scaleX = targetWidthPt / srcWidth;
    const scaleY = targetHeightPt / srcHeight;
    const scale = Math.max(scaleX, scaleY); // cover: use larger scale to fill

    const scaledWidth = srcWidth * scale;
    const scaledHeight = srcHeight * scale;

    // Center the scaled page, offset by bleed
    const offsetX = bleedPt + (targetWidthPt - scaledWidth) / 2;
    const offsetY = bleedPt + (targetHeightPt - scaledHeight) / 2;

    newPage.drawPage(embeddedPage, {
      x: offsetX,
      y: offsetY,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const pdfBytes = await outDoc.save();
  return Buffer.from(pdfBytes);
}
