import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
const now = new Date().toISOString();

const { data } = await supabaseAdmin
  .from("posts")
  .select("*")
  .gt("expires_at", now)
  .order("created_at", { ascending: false })
  .limit(20);

  return NextResponse.json({ post: data });
}