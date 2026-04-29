import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const AUTO_HIDE_COUNT = 3;

export async function POST(request: Request) {
  try {
    const { postId, sessionId, reason } = await request.json();

    if (!postId || !sessionId || !reason) {
      return NextResponse.json(
        { error: "通報情報が不足しています。" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("reports")
      .insert({
        post_id: postId,
        session_id: sessionId,
        reason,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "この投稿はすでに通報済みです。" },
          { status: 409 }
        );
      }

      console.error("report insert error:", insertError);

      return NextResponse.json(
        { error: "通報に失敗しました。" },
        { status: 500 }
      );
    }

    const { count, error: countError } = await supabaseAdmin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) {
      console.error("report count error:", countError);
    }

    if ((count ?? 0) >= AUTO_HIDE_COUNT) {
      await supabaseAdmin
        .from("posts")
        .update({ is_hidden: true })
        .eq("id", postId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "通報に失敗しました。" },
      { status: 500 }
    );
  }
}