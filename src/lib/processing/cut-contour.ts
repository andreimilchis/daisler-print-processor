import sharp from "sharp";
import { CutContourParams } from "@/lib/recipes";

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
    // Simple rectangle contour with offset outside trim area
    return {
      type: "rectangle",
      x: -offsetPt,
      y: -offsetPt,
      width: widthPt + 2 * offsetPt,
      height: heightPt + 2 * offsetPt,
    };
  }

  // Shape contour: detect non-transparent edges of image
  const meta = await sharp(imageBuffer).metadata();
  if (!meta.width || !meta.height) {
    // Fallback to rectangle
    return {
      type: "rectangle",
      x: -offsetPt,
      y: -offsetPt,
      width: widthPt + 2 * offsetPt,
      height: heightPt + 2 * offsetPt,
    };
  }

  // Extract alpha channel and find bounding contour
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Sample contour points by scanning edges
  const points: { x: number; y: number }[] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 200)); // ~200 sample points per edge

  // Scan from top
  for (let x = 0; x < w; x += step) {
    for (let y = 0; y < h; y++) {
      const alpha = data[(y * w + x) * channels + 3];
      if (alpha > 128) {
        points.push({ x, y });
        break;
      }
    }
  }

  // Scan from right
  for (let y = 0; y < h; y += step) {
    for (let x = w - 1; x >= 0; x--) {
      const alpha = data[(y * w + x) * channels + 3];
      if (alpha > 128) {
        points.push({ x, y });
        break;
      }
    }
  }

  // Scan from bottom
  for (let x = w - 1; x >= 0; x -= step) {
    for (let y = h - 1; y >= 0; y--) {
      const alpha = data[(y * w + x) * channels + 3];
      if (alpha > 128) {
        points.push({ x, y });
        break;
      }
    }
  }

  // Scan from left
  for (let y = h - 1; y >= 0; y -= step) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * channels + 3];
      if (alpha > 128) {
        points.push({ x, y });
        break;
      }
    }
  }

  if (points.length < 3) {
    // Not enough contour points, fallback to rectangle
    return {
      type: "rectangle",
      x: -offsetPt,
      y: -offsetPt,
      width: widthPt + 2 * offsetPt,
      height: heightPt + 2 * offsetPt,
    };
  }

  // Convert pixel coordinates to PDF points with offset
  const scaleX = widthPt / w;
  const scaleY = heightPt / h;
  const offsetPxX = contourParams.offsetMm / widthMm * w;
  const offsetPxY = contourParams.offsetMm / heightMm * h;

  // Apply offset by expanding points outward from center
  const centerX = w / 2;
  const centerY = h / 2;

  const shapePath = points.map((p) => {
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const expandFactor = dist > 0 ? (dist + Math.sqrt(offsetPxX * offsetPxX + offsetPxY * offsetPxY)) / dist : 1;

    return {
      x: (centerX + dx * expandFactor) * scaleX,
      y: (centerY + dy * expandFactor) * scaleY,
    };
  });

  return {
    type: "shape",
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
    shapePath,
  };
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
