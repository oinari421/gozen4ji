import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getClientIp, hashIp } from "@/lib/session";
import { validatePostText } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { text, sessionId } = await request.json();

    const errorMessage = validatePostText(text);
    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();

    const { data: recentPost, error: recentError } = await supabaseAdmin
      .from("posts")
      .select("id")
      .or(`session_id.eq.${sessionId},ip_hash.eq.${ipHash}`)
      .gte("created_at", tenSecondsAgo)
      .limit(1)
      .maybeSingle();

    if (recentError) {
      console.error("Supabase recent post check error:", recentError);

      return NextResponse.json(
        { error: "投稿確認に失敗しました。" },
        { status: 500 }
      );
    }

    if (recentPost) {
      return NextResponse.json(
        { error: "連続投稿はできません。少し待ってから投稿してください。" },
        { status: 429 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(4, 0, 0, 0);

    if (now.getHours() >= 4) {
      expiresAt.setDate(expiresAt.getDate() + 1);
    }

    const { error } = await supabaseAdmin.from("posts").insert({
      text: text.trim(),
      session_id: sessionId,
      ip_hash: ipHash,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "投稿に失敗しました。" },
      { status: 500 }
    );
  }
}