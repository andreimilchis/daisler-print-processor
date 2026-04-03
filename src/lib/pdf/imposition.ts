import { PDFDocument, rgb, degrees } from 'pdf-lib';

const MM_TO_PT = 2.83465;

export interface LayoutResult {
  cols: number;
  rows: number;
  count: number;
  rotated: boolean;
}

export interface ImpositionConfig {
  sheetWidthMm: number;
  sheetHeightMm: number;
  spacingMm: number;
  mode: 'auto' | 'manual';
  manualRows?: number;
  manualCols?: number;
}

export interface ImpositionPdfResult {
  pdfBuffer: Buffer;
  layout: LayoutResult;
}

function calcFit(
  sheetW: number,
  sheetH: number,
  itemW: number,
  itemH: number,
  spacing: number
): { cols: number; rows: number; count: number } {
  if (itemW <= 0 || itemH <= 0) return { cols: 0, rows: 0, count: 0 };
  const cols = Math.floor((sheetW + spacing) / (itemW + spacing));
  const rows = Math.floor((sheetH + spacing) / (itemH + spacing));
  return { cols, rows, count: cols * rows };
}

export function calcLayout(
  itemWidthMm: number,  // trim width
  itemHeightMm: number, // trim height
  bleedMm: number,
  config: ImpositionConfig
): LayoutResult {
  const elemW = itemWidthMm + 2 * bleedMm;
  const elemH = itemHeightMm + 2 * bleedMm;
  const { sheetWidthMm, sheetHeightMm, spacingMm, mode, manualRows, manualCols } = config;

  if (mode === 'manual' && manualRows && manualCols) {
    return { cols: manualCols, rows: manualRows, count: manualCols * manualRows, rotated: false };
  }

  const portrait  = calcFit(sheetWidthMm, sheetHeightMm, elemW, elemH, spacingMm);
  const landscape = calcFit(sheetWidthMm, sheetHeightMm, elemH, elemW, spacingMm);

  if (landscape.count > portrait.count) {
    return { ...landscape, rotated: true };
  }
  return { ...portrait, rotated: false };
}

/**
 * Generates an imposition PDF placing the processed image (with bleed) on a sheet.
 * Cut guide lines are drawn in the spacing gaps between elements.
 */
export async function generateImpositionPdf(
  imageBuffer: Buffer, // processed image with bleed applied
  itemWidthMm: number,
  itemHeightMm: number,
  bleedMm: number,
  config: ImpositionConfig
): Promise<ImpositionPdfResult> {
  const layout = calcLayout(itemWidthMm, itemHeightMm, bleedMm, config);

  if (layout.count === 0) {
    const elemW = itemWidthMm + 2 * bleedMm;
    const elemH = itemHeightMm + 2 * bleedMm;
    throw new Error(
      `Elementul (${elemW.toFixed(0)}×${elemH.toFixed(0)}mm cu bleed) nu încape pe coala ` +
      `${config.sheetWidthMm}×${config.sheetHeightMm}mm. Alege o coală mai mare sau reduce dimensiunile.`
    );
  }

  const { cols, rows, rotated } = layout;
  const { sheetWidthMm, sheetHeightMm, spacingMm } = config;

  // Actual element dimensions as placed on sheet (respecting rotation)
  const elemW = itemWidthMm + 2 * bleedMm;
  const elemH = itemHeightMm + 2 * bleedMm;
  const placeW = rotated ? elemH : elemW;
  const placeH = rotated ? elemW : elemH;

  // Center the grid on the sheet
  const gridW = cols * placeW + (cols - 1) * spacingMm;
  const gridH = rows * placeH + (rows - 1) * spacingMm;
  const marginLeft = (sheetWidthMm - gridW) / 2;
  const marginTop  = (sheetHeightMm - gridH) / 2;

  const sheetWPt = sheetWidthMm * MM_TO_PT;
  const sheetHPt = sheetHeightMm * MM_TO_PT;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Impozare');
  pdfDoc.setProducer('Daisler Print File Processor');

  const page = pdfDoc.addPage([sheetWPt, sheetHPt]);

  // Embed image
  const isJpeg = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
  const image = isJpeg
    ? await pdfDoc.embedJpg(imageBuffer)
    : await pdfDoc.embedPng(imageBuffer);

  // Draw elements on grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xMm = marginLeft + col * (placeW + spacingMm);
      // PDF y-axis is bottom-up — invert row order
      const yMm = sheetHeightMm - marginTop - (row + 1) * placeH - row * spacingMm;

      const xPt = xMm * MM_TO_PT;
      const yPt = yMm * MM_TO_PT;

      if (rotated) {
        // Rotated 90°: translate origin, rotate, draw
        page.drawImage(image, {
          x: xPt + placeW * MM_TO_PT,
          y: yPt,
          width: elemW * MM_TO_PT,
          height: elemH * MM_TO_PT,
          rotate: degrees(90),
        });
      } else {
        page.drawImage(image, {
          x: xPt,
          y: yPt,
          width: placeW * MM_TO_PT,
          height: placeH * MM_TO_PT,
        });
      }
    }
  }

  // Draw cut guide lines in the spacing gaps
  const guideColor = rgb(0.5, 0.5, 0.5);
  const guideThickness = 0.3;

  // Vertical guide lines (between columns)
  for (let col = 1; col < cols; col++) {
    const xMm = marginLeft + col * placeW + (col - 1) * spacingMm + spacingMm / 2;
    const xPt = xMm * MM_TO_PT;
    const yStartPt = marginTop * MM_TO_PT;
    const yEndPt   = (sheetHeightMm - marginTop) * MM_TO_PT;
    page.drawLine({
      start: { x: xPt, y: yStartPt },
      end:   { x: xPt, y: yEndPt },
      thickness: guideThickness,
      color: guideColor,
    });
  }

  // Horizontal guide lines (between rows)
  for (let row = 1; row < rows; row++) {
    const yMm = marginTop + row * placeH + (row - 1) * spacingMm + spacingMm / 2;
    const yPt = (sheetHeightMm - yMm) * MM_TO_PT;
    const xStartPt = marginLeft * MM_TO_PT;
    const xEndPt   = (sheetWidthMm - marginLeft) * MM_TO_PT;
    page.drawLine({
      start: { x: xStartPt, y: yPt },
      end:   { x: xEndPt,   y: yPt },
      thickness: guideThickness,
      color: guideColor,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { pdfBuffer: Buffer.from(pdfBytes), layout };
}
