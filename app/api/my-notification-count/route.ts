import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ count: 0 });
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        id,
        replies ( id ),
        empathies ( id )
      `)
      .eq("session_id", sessionId)
      .eq("status", "active")
      .eq("is_deleted", false)
      .gt("expires_at", now);

    if (error || !data) {
      return NextResponse.json({ count: 0 });
    }

    const count = data.reduce((sum, post) => {
      return sum + (post.replies?.length || 0) + (post.empathies?.length || 0);
    }, 0);

    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}