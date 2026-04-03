import { PDFDocument, PDFName, PDFArray } from 'pdf-lib';

const MM_TO_PT = 2.83465; // 1 mm = 2.83465 pt

/**
 * Adds a CutContour spot color rectangle to a PDF page.
 * Uses Separation color space — the ONLY correct way for plotter recognition.
 * Reference: cut_spot_rect_3.pdf (confirmed working on Daisler machines).
 */
function addCutContourSpotColor(
  pdfDoc: PDFDocument,
  pageIndex: number,
  trimX: number,
  trimY: number,
  trimW: number,
  trimH: number
): void {
  const context = pdfDoc.context;
  const page = pdfDoc.getPage(pageIndex);

  // 1. Create the tint transform function (Type 2 — Exponential)
  //    tint 0 → CMYK [0,0,0,0] (no ink)
  //    tint 1 → CMYK [0,1,0,0] (magenta — for on-screen visualization only)
  const tintTransform = context.obj({
    FunctionType: 2,
    Domain: [0, 1],
    C0: [0, 0, 0, 0],
    C1: [0, 1, 0, 0],
    N: 1,
  });

  // 2. Create Separation color space array:
  //    [/Separation /CutContour /DeviceCMYK <<tintTransform>>]
  const separationCS = context.obj([
    PDFName.of('Separation'),
    PDFName.of('CutContour'),
    PDFName.of('DeviceCMYK'),
    tintTransform,
  ]);
  const csRef = context.register(separationCS);

  // 3. Register the color space in page Resources
  const resources = page.node.Resources();
  if (!resources) return;

  let colorSpaceDict = resources.get(PDFName.of('ColorSpace'));
  if (!colorSpaceDict) {
    const newDict = context.obj({});
    resources.set(PDFName.of('ColorSpace'), newDict);
    colorSpaceDict = newDict;
  }
  // @ts-expect-error — PDFDict.set is accessible at runtime
  colorSpaceDict.set(PDFName.of('CS_CutContour'), csRef);

  // 4. Build PDF content stream operators for the spot color rectangle
  //    CS = set stroke color space
  //    SCN = set stroke color (works with Separation)
  //    re = rectangle path
  //    S = stroke (hairline, not fill)
  const operators = [
    'q',
    '0.25 w',
    '/CS_CutContour CS',
    '1 SCN',
    `${trimX.toFixed(4)} ${trimY.toFixed(4)} ${trimW.toFixed(4)} ${trimH.toFixed(4)} re`,
    'S',
    'Q',
  ].join('\n');

  const streamBytes = Buffer.from(operators);
  const contentStream = context.stream(streamBytes, {
    Length: streamBytes.length,
  });
  const streamRef = context.register(contentStream);

  // 5. Append stream to page Contents (on top of existing content)
  const existingContents = page.node.get(PDFName.of('Contents'));
  if (existingContents instanceof PDFArray) {
    existingContents.push(streamRef);
  } else if (existingContents) {
    page.node.set(
      PDFName.of('Contents'),
      context.obj([existingContents, streamRef])
    );
  } else {
    page.node.set(PDFName.of('Contents'), context.obj([streamRef]));
  }
}

export interface ExportPdfOptions {
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  cutContour: boolean;
  filename: string;
}

/**
 * Generates a print-ready PDF from a processed image buffer (with bleed).
 * - MediaBox = BleedBox = total size with bleed
 * - TrimBox = final size at correct offset
 * - ZERO auxiliary lines in the output
 * - Optional: CutContour as true Separation color space
 */
export async function exportPdf(
  imageBuffer: Buffer,
  options: ExportPdfOptions
): Promise<Buffer> {
  const { widthMm, heightMm, bleedMm, cutContour, filename } = options;

  const totalWMm = widthMm + 2 * bleedMm;
  const totalHMm = heightMm + 2 * bleedMm;

  const pageWPt = totalWMm * MM_TO_PT;
  const pageHPt = totalHMm * MM_TO_PT;
  const bleedPt = bleedMm * MM_TO_PT;
  const trimWPt = widthMm * MM_TO_PT;
  const trimHPt = heightMm * MM_TO_PT;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(filename);
  pdfDoc.setProducer('Daisler Print File Processor');
  pdfDoc.setCreator('daisler.ro');

  const page = pdfDoc.addPage([pageWPt, pageHPt]);

  // Set PDF boxes
  // MediaBox = full page (with bleed) — bottom-left origin
  page.setMediaBox(0, 0, pageWPt, pageHPt);
  // BleedBox = same as MediaBox for our use case
  page.setBleedBox(0, 0, pageWPt, pageHPt);
  // TrimBox = final trim size, offset by bleed
  page.setTrimBox(bleedPt, bleedPt, trimWPt, trimHPt);

  // Embed image — try JPEG first (CMYK), fall back to PNG
  let image;
  const isJpeg =
    imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
  const isPng =
    imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;

  if (isJpeg) {
    image = await pdfDoc.embedJpg(imageBuffer);
  } else if (isPng) {
    image = await pdfDoc.embedPng(imageBuffer);
  } else {
    // Default attempt as JPEG
    image = await pdfDoc.embedJpg(imageBuffer);
  }

  // Draw image filling entire page (bleed included) — NO auxiliary elements
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageWPt,
    height: pageHPt,
  });

  // Add CutContour spot color on top (if enabled)
  if (cutContour && bleedMm > 0) {
    addCutContourSpotColor(pdfDoc, 0, bleedPt, bleedPt, trimWPt, trimHPt);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
