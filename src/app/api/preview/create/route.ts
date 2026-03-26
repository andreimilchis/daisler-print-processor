import { NextRequest, NextResponse } from "next/server";
import { getSupabase, generateShareToken } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File | null;
    const fileName = formData.get("fileName") as string;
    const fileSize = Number(formData.get("fileSize") || 0);
    const paramsJson = formData.get("params") as string | null;

    if (!pdfFile || !fileName) {
      return NextResponse.json({ error: "PDF sau nume lipsă" }, { status: 400 });
    }

    const supabase = getSupabase();
    const token = generateShareToken();
    const storagePath = `previews/${token}.pdf`;

    // Upload PDF to Supabase Storage
    const pdfBuffer = await pdfFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Eroare la upload PDF" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(storagePath);

    // Create preview record
    const { data, error: dbError } = await supabase
      .from("previews")
      .insert({
        share_token: token,
        file_name: fileName,
        file_size: fileSize,
        pdf_storage_path: storagePath,
        pdf_public_url: urlData.publicUrl,
        params: paramsJson ? JSON.parse(paramsJson) : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: "Eroare la salvare preview" }, { status: 500 });
    }

    return NextResponse.json({
      token,
      previewUrl: `/preview/${token}`,
      id: data.id,
    });
  } catch (err) {
    console.error("Preview create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Eroare la creare preview" },
      { status: 500 }
    );
  }
}
