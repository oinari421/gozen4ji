import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ count: 0 });
    }

    await supabaseAdmin.from("active_sessions").upsert({
      session_id: sessionId,
      last_seen_at: new Date().toISOString(),
    });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count } = await supabaseAdmin
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", fiveMinutesAgo);

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}