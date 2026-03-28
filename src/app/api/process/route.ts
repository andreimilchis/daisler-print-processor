import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/lib/processing/pipeline";
import { processPdfInput } from "@/lib/processing/pdf-input";
import crypto from "crypto";

export const maxDuration = 120; // Allow longer for AI operations

// Simple in-memory cache for processed PDFs (server-side)
const pdfCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 20;

function getCacheKey(fileName: string, fileSize: number, params: string): string {
  return crypto.createHash("md5").update(`${fileName}:${fileSize}:${params}`).digest("hex");
}

function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of pdfCache) {
    if (now - entry.timestamp > CACHE_TTL) {
      pdfCache.delete(key);
    }
  }
  // Evict oldest if too many
  if (pdfCache.size > MAX_CACHE_ENTRIES) {
    const oldest = [...pdfCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < oldest.length - MAX_CACHE_ENTRIES; i++) {
      pdfCache.delete(oldest[i][0]);
    }
  }
}

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

    // Check cache (only for non-AI operations which are deterministic)
    const hasAi = params.enableAiFill || params.enableAiUpscaling || params.removeBg;
    const cacheKey = getCacheKey(file.name, file.size, paramsJson);

    if (!hasAi) {
      const cached = pdfCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return new NextResponse(new Uint8Array(cached.buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "")}_print.pdf"`,
            "X-Cache": "HIT",
          },
        });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Detect if input is PDF → use vector-preserving PDF processor
    const isPdfInput = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const pdfBuffer = isPdfInput
      ? await processPdfInput(buffer, params, file.name)
      : await processFile(buffer, params, file.name);

    // Cache non-AI results
    if (!hasAi) {
      cleanCache();
      pdfCache.set(cacheKey, { buffer: pdfBuffer, timestamp: Date.now() });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "")}_print.pdf"`,
        "X-Cache": "MISS",
      },
    });
  } catch (err) {
    console.error("Processing error:", err);

    // User-friendly error messages
    let message = "Eroare la procesare";
    if (err instanceof Error) {
      if (err.message.includes("REPLICATE_API_TOKEN")) {
        message = "API-ul AI nu este configurat. Adaugă REPLICATE_API_TOKEN în setările Vercel.";
      } else if (err.message.includes("timed out") || err.message.includes("timeout")) {
        message = "Procesarea a durat prea mult. Încearcă cu o imagine mai mică sau dezactivează funcțiile AI.";
      } else if (err.message.includes("memory") || err.message.includes("heap")) {
        message = "Imaginea e prea mare pentru procesare. Încearcă cu o rezoluție mai mică.";
      } else {
        message = err.message;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
