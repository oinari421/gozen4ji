import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getJapanNow } from "@/lib/time";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    const now = getJapanNow().toISOString();

    let query = supabaseAdmin
      .from("posts")
      .select(`
  id,
  text,
  session_id,
  display_name,
  display_icon,
  created_at,
  reply_count,
  empathy_count,
  replies (
    id,
    text
  )
`)
      .eq("is_restricted", false)
      .eq("is_hidden", false)
      .eq("status", "active")
      .eq("is_deleted", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(20);

    if (sessionId) {
      query = query.neq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error("random posts error:", error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({
      posts: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      posts: [],
    });
  }
}