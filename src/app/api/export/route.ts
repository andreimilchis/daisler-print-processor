import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

import sharp from 'sharp';
import { resizeToFormat } from '@/lib/image/resize';
import { addMirrorBleed } from '@/lib/image/mirror-bleed';
import { convertToCmykJpeg } from '@/lib/image/cmyk';
import { exportPdf } from '@/lib/pdf/export';

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
      cutContour: boolean;
      filename: string;
    };

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 1. Resize to target dimensions
    const resized = await resizeToFormat(inputBuffer, params.width, params.height, params.dpi);

    // 2. Add mirror bleed
    const withBleed = await addMirrorBleed(resized, params.bleed, params.dpi);

    // 3. Convert to CMYK JPEG for print
    let finalImageBuffer: Buffer;
    try {
      finalImageBuffer = await convertToCmykJpeg(withBleed);
    } catch {
      // Fallback: keep as PNG if CMYK conversion fails
      finalImageBuffer = withBleed;
    }

    // 4. Check if we have a JPEG (CMYK might produce JPEG)
    // If not, convert PNG to JPEG for consistency
    const meta = await sharp(finalImageBuffer).metadata();
    if (meta.format !== 'jpeg') {
      finalImageBuffer = await sharp(finalImageBuffer).jpeg({ quality: 95 }).toBuffer();
    }

    // 5. Generate PDF
    const baseName = params.filename.replace(/\.[^/.]+$/, '');
    const pdfBuffer = await exportPdf(finalImageBuffer, {
      widthMm: params.width,
      heightMm: params.height,
      bleedMm: params.bleed,
      cutContour: params.cutContour,
      filename: `${baseName}_print_ready`,
    });

    // 6. Return PDF as download
    const outputFilename = `${baseName}_print_ready.pdf`;
    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json(
      { error: 'Eroare la generarea PDF-ului. Verifică formatul fișierului.' },
      { status: 500 }
    );
  }
}
