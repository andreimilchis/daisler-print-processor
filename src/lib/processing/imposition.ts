import { PDFDocument, degrees, rgb } from "pdf-lib";

const MM_TO_POINTS = 2.835;

export interface ImpositionConfig {
  /** Sheet size to impose onto */
  sheetWidthMm: number;
  sheetHeightMm: number;
  /** Gap between items in mm */
  gapMm: number;
  /** Auto-rotate items to fit more */
  autoRotate: boolean;
  /** Number of copies (0 = fill sheet) */
  copies: number;
}

export interface ImpositionResult {
  pdfBuffer: Buffer;
  itemsPerSheet: number;
  sheetsNeeded: number;
  rotated: boolean;
}

/** Standard sheet sizes for imposition */
export const SHEET_PRESETS = [
  { id: "sra3", name: "SRA3", widthMm: 320, heightMm: 450 },
  { id: "a3", name: "A3", widthMm: 297, heightMm: 420 },
  { id: "a2", name: "A2", widthMm: 420, heightMm: 594 },
  { id: "a1", name: "A1", widthMm: 594, heightMm: 841 },
  { id: "700x1000", name: "70×100 cm", widthMm: 700, heightMm: 1000 },
];

/**
 * Calculate how many items fit on a sheet
 */
function calcFit(
  sheetW: number,
  sheetH: number,
  itemW: number,
  itemH: number,
  gap: number
): { cols: number; rows: number; count: number } {
  if (itemW <= 0 || itemH <= 0) return { cols: 0, rows: 0, count: 0 };
  const cols = Math.floor((sheetW + gap) / (itemW + gap));
  const rows = Math.floor((sheetH + gap) / (itemH + gap));
  return { cols, rows, count: cols * rows };
}

/**
 * Determine best orientation (normal vs rotated) for maximum items
 */
function bestLayout(
  sheetW: number,
  sheetH: number,
  itemW: number,
  itemH: number,
  gap: number,
  autoRotate: boolean
): { cols: number; rows: number; count: number; rotated: boolean } {
  const normal = calcFit(sheetW, sheetH, itemW, itemH, gap);

  if (!autoRotate) {
    return { ...normal, rotated: false };
  }

  const rotated = calcFit(sheetW, sheetH, itemH, itemW, gap);

  if (rotated.count > normal.count) {
    return { ...rotated, rotated: true };
  }
  return { ...normal, rotated: false };
}

/**
 * Take a print-ready PDF (single item with bleed) and impose it onto sheets
 */
export async function imposeOnSheet(
  itemPdfBuffer: Buffer,
  itemWidthMm: number,
  itemHeightMm: number,
  bleedMm: number,
  config: ImpositionConfig
): Promise<ImpositionResult> {
  const srcDoc = await PDFDocument.load(itemPdfBuffer);
  const outDoc = await PDFDocument.create();
  outDoc.setTitle("Impozare");
  outDoc.setProducer("Daisler Print File Processor");

  // Item total size including bleed
  const itemTotalW = itemWidthMm + 2 * bleedMm;
  const itemTotalH = itemHeightMm + 2 * bleedMm;

  // Find best layout
  const layout = bestLayout(
    config.sheetWidthMm,
    config.sheetHeightMm,
    itemTotalW,
    itemTotalH,
    config.gapMm,
    config.autoRotate
  );

  if (layout.count === 0) {
    throw new Error(
      `Itemul (${itemTotalW.toFixed(0)}×${itemTotalH.toFixed(0)}mm) nu încape pe coala ${config.sheetWidthMm}×${config.sheetHeightMm}mm`
    );
  }

  // Actual item dimensions after potential rotation
  const placeW = layout.rotated ? itemTotalH : itemTotalW;
  const placeH = layout.rotated ? itemTotalW : itemTotalH;

  // How many total copies
  const totalCopies = config.copies > 0 ? config.copies : layout.count;
  const sheetsNeeded = Math.ceil(totalCopies / layout.count);

  // Sheet size in points
  const sheetWPt = config.sheetWidthMm * MM_TO_POINTS;
  const sheetHPt = config.sheetHeightMm * MM_TO_POINTS;

  // Centering offset: center the grid on the sheet
  const gridW = layout.cols * placeW + (layout.cols - 1) * config.gapMm;
  const gridH = layout.rows * placeH + (layout.rows - 1) * config.gapMm;
  const marginLeftMm = (config.sheetWidthMm - gridW) / 2;
  const marginTopMm = (config.sheetHeightMm - gridH) / 2;

  // Embed the first page of the source PDF
  const [embeddedPage] = await outDoc.embedPdf(srcDoc, [0]);

  let placed = 0;

  for (let s = 0; s < sheetsNeeded; s++) {
    const page = outDoc.addPage([sheetWPt, sheetHPt]);

    for (let row = 0; row < layout.rows && placed < totalCopies; row++) {
      for (let col = 0; col < layout.cols && placed < totalCopies; col++) {
        const xMm = marginLeftMm + col * (placeW + config.gapMm);
        // PDF y-axis is bottom-up, so we invert
        const yMm = config.sheetHeightMm - marginTopMm - (row + 1) * placeH - row * config.gapMm;

        const xPt = xMm * MM_TO_POINTS;
        const yPt = yMm * MM_TO_POINTS;

        if (layout.rotated) {
          // Draw rotated: we need to translate and rotate
          // Place the page rotated 90 degrees
          page.drawPage(embeddedPage, {
            x: xPt + placeW * MM_TO_POINTS,
            y: yPt,
            width: itemTotalW * MM_TO_POINTS,
            height: itemTotalH * MM_TO_POINTS,
            rotate: degrees(90),
          });
        } else {
          page.drawPage(embeddedPage, {
            x: xPt,
            y: yPt,
            width: placeW * MM_TO_POINTS,
            height: placeH * MM_TO_POINTS,
          });
        }

        placed++;
      }
    }

    // Draw cut guides (light gray lines between items)
    const guideColor = rgb(0.7, 0.7, 0.7);
    const guideWidth = 0.25;

    // Vertical cut lines
    for (let col = 0; col <= layout.cols; col++) {
      const xMm = marginLeftMm + col * (placeW + config.gapMm) - config.gapMm / 2;
      if (col === 0) continue; // skip first
      if (col === layout.cols) continue; // skip last
      const xPt = xMm * MM_TO_POINTS;
      page.drawLine({
        start: { x: xPt, y: marginTopMm * MM_TO_POINTS },
        end: { x: xPt, y: (config.sheetHeightMm - marginTopMm) * MM_TO_POINTS },
        thickness: guideWidth,
        color: guideColor,
      });
    }

    // Horizontal cut lines
    for (let row = 0; row <= layout.rows; row++) {
      const yMm = marginTopMm + row * (placeH + config.gapMm) - config.gapMm / 2;
      if (row === 0) continue;
      if (row === layout.rows) continue;
      const yPt = (config.sheetHeightMm - yMm) * MM_TO_POINTS;
      page.drawLine({
        start: { x: marginLeftMm * MM_TO_POINTS, y: yPt },
        end: { x: (config.sheetWidthMm - marginLeftMm) * MM_TO_POINTS, y: yPt },
        thickness: guideWidth,
        color: guideColor,
      });
    }
  }

  const pdfBytes = await outDoc.save();
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    itemsPerSheet: layout.count,
    sheetsNeeded,
    rotated: layout.rotated,
  };
}
