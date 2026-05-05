import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const date = url.searchParams.get("date");
    const keyword = url.searchParams.get("keyword");
    const sessionId = url.searchParams.get("sessionId");
    const status = url.searchParams.get("status");

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
        report_count,
        is_deleted,
        is_restricted,
        status
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (date) {
      const start = new Date(`${date}T00:00:00+09:00`).toISOString();
      const end = new Date(`${date}T23:59:59+09:00`).toISOString();

      query = query
        .gte("created_at", start)
        .lte("created_at", end);
    }

    if (keyword) {
      query = query.ilike("text", `%${keyword}%`);
    }

    if (sessionId) {
      query = query.ilike("session_id", `%${sessionId}%`);
    }

    if (status === "normal") {
      query = query
        .eq("is_deleted", false)
        .eq("is_restricted", false);
    }

    if (status === "deleted") {
      query = query.eq("is_deleted", true);
    }

    if (status === "restricted") {
      query = query.eq("is_restricted", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("admin posts error:", error);
      return NextResponse.json({ posts: [] }, { status: 500 });
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    console.error("admin posts catch error:", error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}