import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getMockupConfig } from "@/lib/mockup-config";

// SVG templates for product shapes
function getMugSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number): string {
  const mugLeft = imgX - 20;
  const mugTop = imgY - 60;
  const mugW = imgW + 40;
  const mugH = imgH + 120;
  const handleX = mugLeft + mugW;
  const handleY = mugTop + 40;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Shadow -->
    <ellipse cx="${mugLeft + mugW/2 + 5}" cy="${mugTop + mugH + 5}" rx="${mugW/2 + 10}" ry="18" fill="rgba(0,0,0,0.08)"/>
    <!-- Mug body -->
    <rect x="${mugLeft}" y="${mugTop}" width="${mugW}" height="${mugH}" rx="12" fill="white" stroke="#d0d0d0" stroke-width="1.5"/>
    <!-- Top rim -->
    <ellipse cx="${mugLeft + mugW/2}" cy="${mugTop}" rx="${mugW/2}" ry="14" fill="#f8f8f8" stroke="#d0d0d0" stroke-width="1.5"/>
    <!-- Inner rim -->
    <ellipse cx="${mugLeft + mugW/2}" cy="${mugTop}" rx="${mugW/2 - 8}" ry="10" fill="#e8e8e8" stroke="#ccc" stroke-width="0.5"/>
    <!-- Handle -->
    <path d="M${handleX},${handleY} C${handleX + 55},${handleY} ${handleX + 55},${handleY + mugH - 100} ${handleX},${handleY + mugH - 100}" fill="none" stroke="#d0d0d0" stroke-width="14" stroke-linecap="round"/>
    <path d="M${handleX},${handleY}" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
    <path d="M${handleX},${handleY} C${handleX + 48},${handleY} ${handleX + 48},${handleY + mugH - 100} ${handleX},${handleY + mugH - 100}" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
    <!-- Bottom -->
    <rect x="${mugLeft + 4}" y="${mugTop + mugH - 8}" width="${mugW - 8}" height="8" rx="4" fill="#eee"/>
  </svg>`;
}

function getCardSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number): string {
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Desk surface gradient -->
    <defs>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8e0d4"/>
        <stop offset="100%" stop-color="#d4ccc0"/>
      </linearGradient>
    </defs>
    <rect width="${cw}" height="${ch}" fill="url(#desk)"/>
    <!-- Wood grain lines -->
    <line x1="0" y1="${ch*0.3}" x2="${cw}" y2="${ch*0.32}" stroke="#d8d0c4" stroke-width="0.5"/>
    <line x1="0" y1="${ch*0.6}" x2="${cw}" y2="${ch*0.58}" stroke="#d8d0c4" stroke-width="0.5"/>
    <!-- Card shadow -->
    <rect x="${imgX + 6}" y="${imgY + 6}" width="${imgW}" height="${imgH}" rx="6" fill="rgba(0,0,0,0.12)"/>
    <!-- Card base -->
    <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="6" fill="white" stroke="#e0e0e0" stroke-width="0.5"/>
  </svg>`;
}

function getTshirtSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number): string {
  const cx = cw / 2;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- T-shirt shape -->
    <path d="
      M${cx - 120},100
      L${cx - 200},140
      L${cx - 260},250
      L${cx - 190},280
      L${cx - 160},200
      L${cx - 160},${ch - 80}
      L${cx + 160},${ch - 80}
      L${cx + 160},200
      L${cx + 190},280
      L${cx + 260},250
      L${cx + 200},140
      L${cx + 120},100
      Q${cx + 60},130 ${cx},140
      Q${cx - 60},130 ${cx - 120},100
      Z
    " fill="#2d2d2d" stroke="#222" stroke-width="2"/>
    <!-- Collar -->
    <path d="
      M${cx - 120},100
      Q${cx - 60},145 ${cx},155
      Q${cx + 60},145 ${cx + 120},100
      Q${cx + 60},120 ${cx},130
      Q${cx - 60},120 ${cx - 120},100
    " fill="#222" stroke="#1a1a1a" stroke-width="1"/>
    <!-- Stitch lines -->
    <path d="M${cx - 160},200 L${cx - 160},${ch - 80}" stroke="#444" stroke-width="0.5" stroke-dasharray="3,3"/>
    <path d="M${cx + 160},200 L${cx + 160},${ch - 80}" stroke="#444" stroke-width="0.5" stroke-dasharray="3,3"/>
  </svg>`;
}

function getPaperSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number, dark = false): string {
  const pad = 20;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    ${dark ? '<rect width="' + cw + '" height="' + ch + '" fill="#3a3a3f"/>' : ''}
    <!-- Paper shadow -->
    <rect x="${imgX - pad + 8}" y="${imgY - pad + 8}" width="${imgW + pad*2}" height="${imgH + pad*2}" rx="3" fill="rgba(0,0,0,${dark ? '0.3' : '0.1'})"/>
    <!-- Paper -->
    <rect x="${imgX - pad}" y="${imgY - pad}" width="${imgW + pad*2}" height="${imgH + pad*2}" rx="3" fill="white" stroke="#ddd" stroke-width="${dark ? '0' : '0.5'}"/>
  </svg>`;
}

function getStickerSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number): string {
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Surface texture -->
    <rect width="${cw}" height="${ch}" fill="#f2f0ed"/>
    <!-- Peel shadow (bottom right lifted) -->
    <path d="M${imgX + 5},${imgY + imgH} L${imgX + imgW + 5},${imgY + imgH} L${imgX + imgW + 8},${imgY + imgH - 20} L${imgX + imgW - 20},${imgY + imgH + 8} Z" fill="rgba(0,0,0,0.06)"/>
    <!-- Main shadow -->
    <rect x="${imgX + 4}" y="${imgY + 4}" width="${imgW}" height="${imgH}" rx="10" fill="rgba(0,0,0,0.08)"/>
    <!-- Sticker base -->
    <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="10" fill="white" stroke="#e5e5e5" stroke-width="0.5"/>
  </svg>`;
}

function getBannerSvg(cw: number, ch: number, imgX: number, imgY: number, imgW: number, imgH: number): string {
  const standX1 = imgX + imgW / 2 - 60;
  const standX2 = imgX + imgW / 2 + 60;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Floor -->
    <rect x="0" y="${ch - 40}" width="${cw}" height="40" fill="#d5d5d5"/>
    <!-- Stand legs -->
    <line x1="${standX1}" y1="${imgY + imgH}" x2="${standX1 - 40}" y2="${ch - 40}" stroke="#888" stroke-width="3"/>
    <line x1="${standX2}" y1="${imgY + imgH}" x2="${standX2 + 40}" y2="${ch - 40}" stroke="#888" stroke-width="3"/>
    <!-- Stand feet -->
    <rect x="${standX1 - 55}" y="${ch - 44}" width="30" height="6" rx="2" fill="#999"/>
    <rect x="${standX2 + 25}" y="${ch - 44}" width="30" height="6" rx="2" fill="#999"/>
    <!-- Banner shadow -->
    <rect x="${imgX + 5}" y="${imgY + 5}" width="${imgW}" height="${imgH}" fill="rgba(0,0,0,0.08)"/>
    <!-- Banner frame -->
    <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" fill="white" stroke="#ccc" stroke-width="1"/>
    <!-- Top bar -->
    <rect x="${imgX - 5}" y="${imgY - 6}" width="${imgW + 10}" height="8" rx="2" fill="#aaa"/>
  </svg>`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const presetId = formData.get("presetId") as string;

    if (!file || !presetId) {
      return NextResponse.json({ error: "Fișier sau presetId lipsă" }, { status: 400 });
    }

    const config = getMockupConfig(presetId);
    if (!config) {
      return NextResponse.json({ error: "Mockup necunoscut" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { w, h, x, y } = config.imageRegion;
    const { canvasWidth: cw, canvasHeight: ch } = config;

    // Resize image to fit the mockup region
    const resized = await sharp(buffer)
      .resize(w, h, { fit: "cover" })
      .png()
      .toBuffer();

    // Get SVG template based on product type
    let svgTemplate: string;
    switch (presetId) {
      case "cana":
        svgTemplate = getMugSvg(cw, ch, x, y, w, h);
        break;
      case "carte-vizita":
        svgTemplate = getCardSvg(cw, ch, x, y, w, h);
        break;
      case "tricou":
        svgTemplate = getTshirtSvg(cw, ch, x, y, w, h);
        break;
      case "sticker":
        svgTemplate = getStickerSvg(cw, ch, x, y, w, h);
        break;
      case "banner":
        svgTemplate = getBannerSvg(cw, ch, x, y, w, h);
        break;
      case "poster-a3":
        svgTemplate = getPaperSvg(cw, ch, x, y, w, h, true);
        break;
      default:
        svgTemplate = getPaperSvg(cw, ch, x, y, w, h, false);
        break;
    }

    // Render SVG template
    const svgBuffer = Buffer.from(svgTemplate);
    const templateLayer = await sharp(svgBuffer).png().toBuffer();

    // Compose: background → SVG template → image
    const mockup = await sharp({
      create: {
        width: cw,
        height: ch,
        channels: 4,
        background: { ...config.background, alpha: 1 },
      },
    })
      .composite([
        { input: templateLayer, left: 0, top: 0 },
        { input: resized, left: x, top: y },
      ])
      .png({ quality: 85 })
      .toBuffer();

    return new NextResponse(new Uint8Array(mockup), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    console.error("Mockup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare generare mockup" },
      { status: 500 }
    );
  }
}
