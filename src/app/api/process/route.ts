import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/lib/processing/pipeline";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const paramsJson = formData.get("params") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Niciun fișier trimis" }, { status: 400 });
    }

    if (!paramsJson) {
      return NextResponse.json({ error: "Parametri lipsă" }, { status: 400 });
    }

    const params = JSON.parse(paramsJson);

    if (!params.targetWidthMm || !params.targetHeightMm || !params.dpi) {
      return NextResponse.json(
        { error: "Dimensiuni sau DPI lipsă" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfBuffer = await processFile(buffer, params, file.name);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "")}_print.pdf"`,
      },
    });
  } catch (err) {
    console.error("Processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare la procesare" },
      { status: 500 }
    );
  }
}
