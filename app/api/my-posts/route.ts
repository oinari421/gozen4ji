import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ posts: [] });
    }

    const { data, error } = await supabaseAdmin
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
          text,
          created_at,
          display_name,
          display_icon
        ),
        empathies (
          id,
          created_at,
          display_name,
          display_icon
        )
      `)
      .eq("session_id", sessionId)
      .eq("status", "active")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error || !data) {
  console.error("my-posts error:", error);
  return NextResponse.json({
    posts: [],
    error,
  });
}

    return NextResponse.json({ posts: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ posts: [] });
  }
}