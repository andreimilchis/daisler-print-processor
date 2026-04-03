import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
import sharp from 'sharp';
import { resizeToFormat } from '@/lib/image/resize';
import { addMirrorBleed } from '@/lib/image/mirror-bleed';
import { checkDpi, DpiCheckResult } from '@/lib/image/dpi-check';
import { addAiBleed } from '@/lib/ai/ai-bleed';
import { aiUpscale } from '@/lib/ai/upscale';

export interface ProcessResult {
  imageBase64: string;
  mimeType: string;
  widthPx: number;
  heightPx: number;
  dpiCheck: DpiCheckResult;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const paramsJson = formData.get('params') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier primit.' }, { status: 400 });
    }
    if (!paramsJson) {
      return NextResponse.json({ error: 'Parametrii lipsesc.' }, { status: 400 });
    }

    const params = JSON.parse(paramsJson) as {
      width: number;
      height: number;
      dpi: number;
      bleed: number;
      useAiBleed?: boolean;
      useAiUpscale?: boolean;
    };

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Get original dimensions for DPI check
    const meta = await sharp(inputBuffer).metadata();
    const origW = meta.width ?? 0;
    const origH = meta.height ?? 0;

    // DPI check against original resolution
    const dpiCheck = checkDpi(origW, origH, params.width, params.height);

    // 1. Optional AI upscale (before resize, if resolution is too low)
    let workBuffer: Buffer = inputBuffer;
    if (params.useAiUpscale && dpiCheck.level !== 'good') {
      workBuffer = (await aiUpscale(inputBuffer, params.width, params.height, params.dpi)) as Buffer;
    }

    // 2. Resize to target dimensions
    const resized = await resizeToFormat(workBuffer, params.width, params.height, params.dpi);

    // 3. Add bleed (AI outpaint or mirror fallback)
    let withBleed: Buffer;
    if (params.useAiBleed && params.bleed > 0) {
      withBleed = (await addAiBleed(resized, params.bleed, params.dpi)) as Buffer;
    } else {
      withBleed = await addMirrorBleed(resized, params.bleed, params.dpi);
    }

    // Get final dimensions
    const finalMeta = await sharp(withBleed).metadata();
    const finalW = finalMeta.width ?? 0;
    const finalH = finalMeta.height ?? 0;

    const imageBase64 = withBleed.toString('base64');

    const result: ProcessResult = {
      imageBase64,
      mimeType: 'image/png',
      widthPx: finalW,
      heightPx: finalH,
      dpiCheck,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Process error:', err);
    return NextResponse.json(
      { error: 'Eroare la procesarea fișierului. Verifică formatul imaginii.' },
      { status: 500 }
    );
  }
}
