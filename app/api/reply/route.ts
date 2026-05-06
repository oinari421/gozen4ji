import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getClientIp, hashIp } from "@/lib/session";
import { validatePostText } from "@/lib/validation";
import { getJapanNow } from "@/lib/time";

function getDayKey() {
  const now = getJapanNow();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
  try {
    const { postId, text, sessionId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "投稿IDがありません。" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "セッション情報がありません。" }, { status: 400 });
    }

    const errorMessage = validatePostText(text);
    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, session_id, reply_count")
      .eq("id", postId)
      .eq("status", "active")
      .eq("is_deleted", false)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "投稿が見つかりません。" }, { status: 404 });
    }

    if (post.session_id === sessionId) {
      return NextResponse.json({ error: "自分の投稿には返信できません。" }, { status: 403 });
    }

    if ((post.reply_count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "この一言には、すでに返事が届いています。" },
        { status: 409 }
      );
    }

    const dayKey = getDayKey();

    const { data: identity, error: identityError } = await supabaseAdmin
      .from("daily_identities")
      .select("display_name, display_icon")
      .eq("session_id", sessionId)
      .eq("day_key", dayKey)
      .maybeSingle();

    if (identityError || !identity) {
      console.error("identity fetch error:", identityError);
      return NextResponse.json(
        { error: "匿名名の取得に失敗しました。" },
        { status: 500 }
      );
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const { error: replyError } = await supabaseAdmin.from("replies").insert({
      post_id: postId,
      text: text.trim(),
      session_id: sessionId,
      ip_hash: ipHash,
      display_name: identity.display_name,
      display_icon: identity.display_icon,
    });

    if (replyError) {
      console.error("reply insert error:", replyError);
      return NextResponse.json({ error: "返信に失敗しました。" }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ reply_count: 1 })
      .eq("id", postId);

    if (updateError) {
      console.error("reply count update error:", updateError);
      return NextResponse.json({ error: "返信に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}