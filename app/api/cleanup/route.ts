import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 30);

  const { error } = await supabaseAdmin
    .from("posts")
    .delete()
    .lt("created_at", limitDate.toISOString());

  if (error) {
    return NextResponse.json({ ok: false, error });
  }

  return NextResponse.json({ ok: true });
}