import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ posts: [], reason: "no sessionId" });
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      console.error("my-posts error:", error);
      return NextResponse.json({
        posts: [],
        reason: "supabase error",
        error,
      });
    }

    return NextResponse.json({
      posts: data ?? [],
      sessionId,
      count: data?.length ?? 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      posts: [],
      reason: "catch error",
      error: String(e),
    });
  }
}