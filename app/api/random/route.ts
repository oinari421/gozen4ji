import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    const now = new Date().toISOString();

    let query = supabaseAdmin
      .from("posts")
      .select(`
        id,
        text,
        session_id,
        created_at,
        reply_count,
        empathy_count,
        replies (
          id,
          text
        )
      `)
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
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ posts: [] });
  }
}