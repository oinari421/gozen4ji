import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { postId, reason } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId がありません。" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "通報理由がありません。" },
        { status: 400 }
      );
    }

    // 1. 通報を保存
    const { error: reportError } = await supabaseAdmin
      .from("reports")
      .insert({
        post_id: postId,
        reason,
        status: "pending",
      });

    if (reportError) {
      console.error("report insert error:", reportError);

      return NextResponse.json(
        { error: "通報に失敗しました。" },
        { status: 500 }
      );
    }

    // 2. 現在の投稿情報を取得
    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("id, report_count")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      console.error("post fetch error:", postError);

      return NextResponse.json(
        { error: "投稿情報の取得に失敗しました。" },
        { status: 500 }
      );
    }

    const nextReportCount = (post.report_count ?? 0) + 1;

    // 3. 通報数を増やす。3件以上なら制限中にする
    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({
        report_count: nextReportCount,
        is_restricted: nextReportCount >= 3,
      })
      .eq("id", postId);

    if (updateError) {
      console.error("post report_count update error:", updateError);

      return NextResponse.json(
        { error: "通報数の更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      report_count: nextReportCount,
      is_restricted: nextReportCount >= 3,
    });
  } catch (error) {
    console.error("report api error:", error);

    return NextResponse.json(
      { error: "通報に失敗しました。" },
      { status: 500 }
    );
  }
}