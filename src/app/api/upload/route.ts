import { NextRequest, NextResponse } from "next/server";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Niciun fișier trimis" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tip neacceptat: ${file.type}. Acceptăm JPG, PNG, PDF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fișierul depășește limita de 50MB" },
        { status: 400 }
      );
    }

    let width: number | undefined;
    let height: number | undefined;

    // Extract dimensions for images
    if (file.type.startsWith("image/")) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const dimensions = getImageDimensions(buffer, file.type);
        width = dimensions?.width;
        height = dimensions?.height;
      } catch {
        // Dimensions optional - continue without them
      }
    }

    return NextResponse.json({
      name: file.name,
      size: file.size,
      type: file.type,
      width,
      height,
    });
  } catch {
    return NextResponse.json(
      { error: "Eroare la procesarea fișierului" },
      { status: 500 }
    );
  }
}

function getImageDimensions(
  buffer: Buffer,
  type: string
): { width: number; height: number } | null {
  try {
    if (type === "image/png") {
      // PNG: width at offset 16, height at offset 20 (4 bytes each, big-endian)
      if (buffer.length < 24) return null;
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }

    if (type === "image/jpeg") {
      // JPEG: search for SOF0 marker (0xFF 0xC0)
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] === 0xff) {
          const marker = buffer[offset + 1];
          if (marker >= 0xc0 && marker <= 0xc3) {
            return {
              height: buffer.readUInt16BE(offset + 5),
              width: buffer.readUInt16BE(offset + 7),
            };
          }
          const segLen = buffer.readUInt16BE(offset + 2);
          offset += 2 + segLen;
        } else {
          offset++;
        }
      }
    }
  } catch {
    // Fall through
  }
  return null;
}
