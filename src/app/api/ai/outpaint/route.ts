import { NextRequest, NextResponse } from "next/server";
import { outpaintImage } from "@/lib/ai/outpaint";
import { mmToPx } from "@/lib/units";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const paramsJson = formData.get("params") as string | null;

    if (!file || !paramsJson) {
      return NextResponse.json({ error: "Fișier sau parametri lipsă" }, { status: 400 });
    }

    const params = JSON.parse(paramsJson);
    const targetWidthPx = mmToPx(params.targetWidthMm, params.dpi);
    const targetHeightPx = mmToPx(params.targetHeightMm, params.dpi);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await outpaintImage(buffer, targetWidthPx, targetHeightPx, params.overlapPercent || 5);

    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("AI Outpaint error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare AI Image Filler" },
      { status: 500 }
    );
  }
}
