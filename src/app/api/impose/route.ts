import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import sharp from 'sharp';
import { resizeToFormat } from '@/lib/image/resize';
import { addMirrorBleed } from '@/lib/image/mirror-bleed';
import { convertToCmykJpeg } from '@/lib/image/cmyk';
import { generateImpositionPdf } from '@/lib/pdf/imposition';

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
      filename: string;
      sheetWidth: number;
      sheetHeight: number;
      spacing: number;
      mode: 'auto' | 'manual';
      rows?: number;
      cols?: number;
    };

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 1. Resize to target
    const resized = await resizeToFormat(inputBuffer, params.width, params.height, params.dpi);

    // 2. Mirror bleed
    const withBleed = await addMirrorBleed(resized, params.bleed, params.dpi);

    // 3. CMYK JPEG
    let imageBuffer: Buffer;
    try {
      imageBuffer = await convertToCmykJpeg(withBleed);
    } catch {
      imageBuffer = withBleed;
    }

    const meta = await sharp(imageBuffer).metadata();
    if (meta.format !== 'jpeg') {
      imageBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
    }

    // 4. Generate imposition PDF
    const baseName = params.filename.replace(/\.[^/.]+$/, '');
    const result = await generateImpositionPdf(imageBuffer, params.width, params.height, params.bleed, {
      sheetWidthMm: params.sheetWidth,
      sheetHeightMm: params.sheetHeight,
      spacingMm: params.spacing,
      mode: params.mode,
      manualRows: params.rows,
      manualCols: params.cols,
    });

    const outputFilename = `${baseName}_impozare_${result.layout.cols}x${result.layout.rows}.pdf`;
    return new NextResponse(result.pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': result.pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare la generarea impozării.';
    console.error('Impose error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
