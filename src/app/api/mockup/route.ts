import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getMockupConfig } from "@/lib/mockup-config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const presetId = formData.get("presetId") as string;
    const targetWidthMm = Number(formData.get("targetWidthMm") || 0);
    const targetHeightMm = Number(formData.get("targetHeightMm") || 0);

    if (!file || !presetId) {
      return NextResponse.json({ error: "Fișier sau presetId lipsă" }, { status: 400 });
    }

    const config = getMockupConfig(presetId);
    if (!config) {
      return NextResponse.json({ error: "Mockup necunoscut" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { w, h, x, y } = config.imageRegion;

    // Resize image to fit the mockup region (cover mode)
    const resized = await sharp(buffer)
      .resize(w, h, { fit: "cover" })
      .png()
      .toBuffer();

    const layers: sharp.OverlayOptions[] = [];

    // Shadow layer
    if (config.shadowOffset) {
      const shadowBg = config.productBg || { r: 0, g: 0, b: 0 };
      const padding = config.productPadding || 0;
      const shadow = await sharp({
        create: {
          width: w + padding * 2,
          height: h + padding * 2,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0.15 },
        },
      })
        .png()
        .toBuffer();

      layers.push({
        input: shadow,
        left: x - padding + config.shadowOffset.x,
        top: y - padding + config.shadowOffset.y,
      });
    }

    // Product background (white card, paper, etc.)
    if (config.productBg) {
      const padding = config.productPadding || 0;
      const productBg = await sharp({
        create: {
          width: w + padding * 2,
          height: h + padding * 2,
          channels: 4,
          background: { ...config.productBg, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      layers.push({
        input: productBg,
        left: x - padding,
        top: y - padding,
      });
    }

    // The actual image
    layers.push({
      input: resized,
      left: x,
      top: y,
    });

    // Compose everything on the canvas
    const mockup = await sharp({
      create: {
        width: config.canvasWidth,
        height: config.canvasHeight,
        channels: 4,
        background: { ...config.background, alpha: 1 },
      },
    })
      .composite(layers)
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
