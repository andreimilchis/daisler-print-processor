import { NextRequest, NextResponse } from "next/server";
import { upscaleImage } from "@/lib/ai/upscale";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const scale = Number(formData.get("scale") || 2) as 2 | 4;

    if (!file) {
      return NextResponse.json({ error: "Niciun fișier trimis" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await upscaleImage(buffer, scale);

    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("AI Upscale error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare AI Upscaling" },
      { status: 500 }
    );
  }
}
