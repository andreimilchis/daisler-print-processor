import { CutContourParams } from "@/lib/recipes";
import { detectContour, smoothContour, expandContour } from "./contour-detect";

const MM_TO_POINTS = 2.835;

interface ContourPath {
  type: "rectangle" | "shape";
  // All in PDF points
  x: number;
  y: number;
  width: number;
  height: number;
  shapePath?: { x: number; y: number }[];
}

export async function generateCutContour(
  imageBuffer: Buffer,
  widthMm: number,
  heightMm: number,
  bleedMm: number,
  contourParams: CutContourParams
): Promise<ContourPath> {
  const offsetPt = contourParams.offsetMm * MM_TO_POINTS;
  const widthPt = widthMm * MM_TO_POINTS;
  const heightPt = heightMm * MM_TO_POINTS;

  if (contourParams.type === "rectangle") {
    return {
      type: "rectangle",
      x: -offsetPt,
      y: -offsetPt,
      width: widthPt + 2 * offsetPt,
      height: heightPt + 2 * offsetPt,
    };
  }

  // Shape contour: use improved contour detection
  try {
    const rawPoints = await detectContour(imageBuffer, 360);

    if (rawPoints.length < 10) {
      // Not enough points, fallback to rectangle
      return {
        type: "rectangle",
        x: -offsetPt,
        y: -offsetPt,
        width: widthPt + 2 * offsetPt,
        height: heightPt + 2 * offsetPt,
      };
    }

    // Smooth the contour for cleaner cut lines
    const smoothed = smoothContour(rawPoints, 5);

    // Expand by offset
    const offsetNormX = contourParams.offsetMm / widthMm;
    const offsetNormY = contourParams.offsetMm / heightMm;
    const expanded = expandContour(smoothed, offsetNormX, offsetNormY);

    // Convert normalized coordinates to PDF points
    const shapePath = expanded.map((p) => ({
      x: p.x * widthPt,
      y: p.y * heightPt,
    }));

    return {
      type: "shape",
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
      shapePath,
    };
  } catch {
    // Fallback to rectangle on any error
    return {
      type: "rectangle",
      x: -offsetPt,
      y: -offsetPt,
      width: widthPt + 2 * offsetPt,
      height: heightPt + 2 * offsetPt,
    };
  }
}

export function drawCutContourOnPage(
  page: { drawRectangle: Function; drawLine: Function },
  contour: ContourPath,
  trimLeft: number,
  trimBottom: number
) {
  const contourColor = { red: 0, green: 1, blue: 0 }; // RGB(0,255,0) = CutContour spot color
  const lineWidth = 0.25;

  if (contour.type === "rectangle") {
    page.drawRectangle({
      x: trimLeft + contour.x,
      y: trimBottom + contour.y,
      width: contour.width,
      height: contour.height,
      borderColor: contourColor,
      borderWidth: lineWidth,
      color: undefined,
    });
  } else if (contour.shapePath && contour.shapePath.length > 1) {
    // Draw shape as connected line segments
    for (let i = 0; i < contour.shapePath.length; i++) {
      const from = contour.shapePath[i];
      const to = contour.shapePath[(i + 1) % contour.shapePath.length];
      page.drawLine({
        start: { x: trimLeft + from.x, y: trimBottom + contour.height - from.y },
        end: { x: trimLeft + to.x, y: trimBottom + contour.height - to.y },
        thickness: lineWidth,
        color: contourColor,
      });
    }
  }
}
