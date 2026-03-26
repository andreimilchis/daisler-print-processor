import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { status, comment } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status invalid" }, { status: 400 });
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from("previews")
      .select("status")
      .eq("share_token", token)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Preview inexistent" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Acest preview a fost deja revizuit" }, { status: 400 });
    }

    const { error } = await supabase
      .from("previews")
      .update({
        status,
        client_comment: comment || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("share_token", token);

    if (error) {
      return NextResponse.json({ error: "Eroare la salvare review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Eroare la procesare" }, { status: 500 });
  }
}
