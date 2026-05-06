import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
    const { postId, sessionId } = await request.json();

    if (!postId || !sessionId) {
      return NextResponse.json(
        { error: "必要な情報がありません。" },
        { status: 400 }
      );
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, empathy_count, status, is_deleted, session_id")
      .eq("id", postId)
      .single();

    if (postError || !post || post.status !== "active" || post.is_deleted) {
      return NextResponse.json(
        { error: "投稿が見つかりません。" },
        { status: 404 }
      );
    }

    if (post.session_id === sessionId) {
      return NextResponse.json(
        { error: "自分の投稿には共感できません。" },
        { status: 403 }
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

    const { error: empathyError } = await supabaseAdmin
      .from("empathies")
      .insert({
        post_id: postId,
        session_id: sessionId,
        display_name: identity.display_name,
        display_icon: identity.display_icon,
      });

    if (empathyError) {
      if (empathyError.code === "23505") {
        return NextResponse.json(
          { error: "すでに共感しています。" },
          { status: 409 }
        );
      }

      console.error("empathy insert error:", empathyError);
      return NextResponse.json(
        { error: "共感に失敗しました。" },
        { status: 500 }
      );
    }

    const nextCount = (post.empathy_count || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({ empathy_count: nextCount })
      .eq("id", postId);

    if (updateError) {
      console.error("empathy count update error:", updateError);
      return NextResponse.json(
        { error: "共感に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      empathy_count: nextCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}