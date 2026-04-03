import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
import sharp from 'sharp';
import { getMockupConfig } from '@/lib/mockup-config';

// ── SVG product templates ─────────────────────────────────────────────────────

function getMugSvg(cw: number, ch: number, x: number, y: number, w: number, h: number): string {
  const ml = x - 20, mt = y - 60, mw = w + 40, mh = h + 120;
  const hx = ml + mw, hy = mt + 40;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${ml+mw/2+5}" cy="${mt+mh+5}" rx="${mw/2+10}" ry="18" fill="rgba(0,0,0,0.08)"/>
    <rect x="${ml}" y="${mt}" width="${mw}" height="${mh}" rx="12" fill="white" stroke="#d0d0d0" stroke-width="1.5"/>
    <ellipse cx="${ml+mw/2}" cy="${mt}" rx="${mw/2}" ry="14" fill="#f8f8f8" stroke="#d0d0d0" stroke-width="1.5"/>
    <ellipse cx="${ml+mw/2}" cy="${mt}" rx="${mw/2-8}" ry="10" fill="#e8e8e8" stroke="#ccc" stroke-width="0.5"/>
    <path d="M${hx},${hy} C${hx+55},${hy} ${hx+55},${hy+mh-100} ${hx},${hy+mh-100}" fill="none" stroke="#d0d0d0" stroke-width="14" stroke-linecap="round"/>
    <path d="M${hx},${hy} C${hx+48},${hy} ${hx+48},${hy+mh-100} ${hx},${hy+mh-100}" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
    <rect x="${ml+4}" y="${mt+mh-8}" width="${mw-8}" height="8" rx="4" fill="#eee"/>
  </svg>`;
}

function getCardSvg(cw: number, ch: number, x: number, y: number, w: number, h: number): string {
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8e0d4"/><stop offset="100%" stop-color="#d4ccc0"/>
      </linearGradient>
    </defs>
    <rect width="${cw}" height="${ch}" fill="url(#desk)"/>
    <line x1="0" y1="${ch*0.3}" x2="${cw}" y2="${ch*0.32}" stroke="#d8d0c4" stroke-width="0.5"/>
    <line x1="0" y1="${ch*0.6}" x2="${cw}" y2="${ch*0.58}" stroke="#d8d0c4" stroke-width="0.5"/>
    <rect x="${x+6}" y="${y+6}" width="${w}" height="${h}" rx="6" fill="rgba(0,0,0,0.12)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="white" stroke="#e0e0e0" stroke-width="0.5"/>
  </svg>`;
}

function getTshirtSvg(cw: number, ch: number): string {
  const cx = cw / 2;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <path d="
      M${cx-120},100 L${cx-200},140 L${cx-260},250 L${cx-190},280
      L${cx-160},200 L${cx-160},${ch-80}
      L${cx+160},${ch-80} L${cx+160},200 L${cx+190},280
      L${cx+260},250 L${cx+200},140 L${cx+120},100
      Q${cx+60},130 ${cx},140 Q${cx-60},130 ${cx-120},100 Z
    " fill="#2d2d2d" stroke="#222" stroke-width="2"/>
    <path d="
      M${cx-120},100 Q${cx-60},145 ${cx},155 Q${cx+60},145 ${cx+120},100
      Q${cx+60},120 ${cx},130 Q${cx-60},120 ${cx-120},100
    " fill="#222"/>
    <path d="M${cx-160},200 L${cx-160},${ch-80}" stroke="#444" stroke-width="0.5" stroke-dasharray="3,3"/>
    <path d="M${cx+160},200 L${cx+160},${ch-80}" stroke="#444" stroke-width="0.5" stroke-dasharray="3,3"/>
  </svg>`;
}

function getBannerSvg(cw: number, ch: number, x: number, y: number, w: number, h: number): string {
  const sx1 = x + w / 2 - 60, sx2 = x + w / 2 + 60;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${ch-40}" width="${cw}" height="40" fill="#d5d5d5"/>
    <line x1="${sx1}" y1="${y+h}" x2="${sx1-40}" y2="${ch-40}" stroke="#888" stroke-width="3"/>
    <line x1="${sx2}" y1="${y+h}" x2="${sx2+40}" y2="${ch-40}" stroke="#888" stroke-width="3"/>
    <rect x="${sx1-55}" y="${ch-44}" width="30" height="6" rx="2" fill="#999"/>
    <rect x="${sx2+25}" y="${ch-44}" width="30" height="6" rx="2" fill="#999"/>
    <rect x="${x+5}" y="${y+5}" width="${w}" height="${h}" fill="rgba(0,0,0,0.08)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="#ccc" stroke-width="1"/>
    <rect x="${x-5}" y="${y-6}" width="${w+10}" height="8" rx="2" fill="#aaa"/>
  </svg>`;
}

function getPaperSvg(cw: number, ch: number, x: number, y: number, w: number, h: number, dark = false): string {
  const pad = 20;
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    ${dark ? `<rect width="${cw}" height="${ch}" fill="#3a3a3f"/>` : ''}
    <rect x="${x-pad+8}" y="${y-pad+8}" width="${w+pad*2}" height="${h+pad*2}" rx="3" fill="rgba(0,0,0,${dark ? 0.3 : 0.1})"/>
    <rect x="${x-pad}" y="${y-pad}" width="${w+pad*2}" height="${h+pad*2}" rx="3" fill="white" stroke="#ddd" stroke-width="${dark ? 0 : 0.5}"/>
  </svg>`;
}

function getStickerSvg(cw: number, ch: number, x: number, y: number, w: number, h: number): string {
  return `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${cw}" height="${ch}" fill="#f2f0ed"/>
    <rect x="${x+4}" y="${y+4}" width="${w}" height="${h}" rx="10" fill="rgba(0,0,0,0.08)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="white" stroke="#e5e5e5" stroke-width="0.5"/>
  </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: 'Fișier sau produs lipsă.' }, { status: 400 });
    }

    const config = getMockupConfig(productId);
    if (!config) {
      return NextResponse.json({ error: 'Produs necunoscut.' }, { status: 400 });
    }

    const { canvasWidth: cw, canvasHeight: ch, background: bg, imageRegion: ir } = config;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize design to fit the product region
    const resized = await sharp(buffer)
      .resize(ir.w, ir.h, { fit: 'cover' })
      .png()
      .toBuffer();

    // Select SVG template
    let svgStr: string;
    switch (productId) {
      case 'cana':        svgStr = getMugSvg(cw, ch, ir.x, ir.y, ir.w, ir.h); break;
      case 'carte-vizita': svgStr = getCardSvg(cw, ch, ir.x, ir.y, ir.w, ir.h); break;
      case 'tricou':      svgStr = getTshirtSvg(cw, ch); break;
      case 'banner':      svgStr = getBannerSvg(cw, ch, ir.x, ir.y, ir.w, ir.h); break;
      case 'sticker':     svgStr = getStickerSvg(cw, ch, ir.x, ir.y, ir.w, ir.h); break;
      case 'poster-a3':   svgStr = getPaperSvg(cw, ch, ir.x, ir.y, ir.w, ir.h, true); break;
      default:            svgStr = getPaperSvg(cw, ch, ir.x, ir.y, ir.w, ir.h, false);
    }

    const templateLayer = await sharp(Buffer.from(svgStr)).png().toBuffer();

    // Composite: background → template → design
    const mockupBuffer = await sharp({
      create: { width: cw, height: ch, channels: 3, background: bg },
    })
      .composite([
        { input: templateLayer, left: 0, top: 0 },
        { input: resized, left: ir.x, top: ir.y },
      ])
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(mockupBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Mockup error:', err);
    return NextResponse.json(
      { error: 'Eroare la generarea mockup-ului. Verifică fișierul.' },
      { status: 500 }
    );
  }
}
