import { NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@/lib/ai/remove-bg";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Niciun fișier trimis" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await removeBackground(buffer);

    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("AI Remove BG error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare eliminare fundal" },
      { status: 500 }
    );
  }
}
