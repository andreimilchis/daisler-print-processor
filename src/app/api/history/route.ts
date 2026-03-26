import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("history")
    .select("*, previews(share_token, status, client_comment)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Eroare la citire istoric" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = getSupabase();
    const { error } = await supabase.from("history").insert({
      file_name: body.fileName,
      file_type: body.fileType,
      file_size: body.fileSize,
      params: body.params,
      preview_id: body.previewId || null,
      status: body.status || "completed",
      error_message: body.errorMessage || null,
      processing_time_ms: body.processingTimeMs || null,
    });

    if (error) {
      console.error("History insert error:", error);
      return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
