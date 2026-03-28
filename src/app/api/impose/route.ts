import { NextRequest, NextResponse } from "next/server";
import { imposeOnSheet, ImpositionConfig } from "@/lib/processing/imposition";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const configJson = formData.get("config") as string | null;
    const itemWidthMm = Number(formData.get("itemWidthMm") || 0);
    const itemHeightMm = Number(formData.get("itemHeightMm") || 0);
    const bleedMm = Number(formData.get("bleedMm") || 0);

    if (!file || !configJson) {
      return NextResponse.json(
        { error: "Fișier PDF sau configurație lipsă" },
        { status: 400 }
      );
    }

    if (!itemWidthMm || !itemHeightMm) {
      return NextResponse.json(
        { error: "Dimensiunile itemului sunt necesare" },
        { status: 400 }
      );
    }

    const config: ImpositionConfig = JSON.parse(configJson);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await imposeOnSheet(
      buffer,
      itemWidthMm,
      itemHeightMm,
      bleedMm,
      config
    );

    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="impozare_${config.sheetWidthMm}x${config.sheetHeightMm}.pdf"`,
        "X-Items-Per-Sheet": String(result.itemsPerSheet),
        "X-Sheets-Needed": String(result.sheetsNeeded),
        "X-Rotated": String(result.rotated),
      },
    });
  } catch (err) {
    console.error("Imposition error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare la impozare" },
      { status: 500 }
    );
  }
}
