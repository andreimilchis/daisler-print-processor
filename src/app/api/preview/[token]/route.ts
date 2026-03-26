import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("previews")
    .select("*")
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Preview inexistent" }, { status: 404 });
  }

  return NextResponse.json(data);
}
