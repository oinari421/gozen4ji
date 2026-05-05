import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("is_restricted", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { postId, action } = await request.json();

  if (!postId || !action) {
    return NextResponse.json(
      { message: "postId または action がありません" },
      { status: 400 }
    );
  }

  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .select("id, ip_hash")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !post) {
    return NextResponse.json(
      { message: "投稿が見つかりません" },
      { status: 404 }
    );
  }

  if (action === "release") {
    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        is_restricted: false,
        report_count: 0,
      })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        is_deleted: true,
        is_restricted: false,
      })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "temporary_ban") {
    if (!post.ip_hash) {
      return NextResponse.json(
        { message: "ip_hash がありません" },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: banError } = await supabaseAdmin
      .from("banned_ips")
      .insert({
        ip_hash: post.ip_hash,
        reason: "通報3件以上による1週間制限",
        ban_type: "temporary",
        expires_at: expiresAt.toISOString(),
        status: "active",
      });

    if (banError) {
      return NextResponse.json({ message: banError.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("posts")
      .update({
        is_restricted: false,
      })
      .eq("id", postId);

    return NextResponse.json({ ok: true });
  }

  if (action === "permanent_ban") {
    if (!post.ip_hash) {
      return NextResponse.json(
        { message: "ip_hash がありません" },
        { status: 400 }
      );
    }

    const { error: banError } = await supabaseAdmin
      .from("banned_ips")
      .insert({
        ip_hash: post.ip_hash,
        reason: "通報3件以上による永久BAN",
        ban_type: "permanent",
        expires_at: null,
        status: "active",
      });

    if (banError) {
      return NextResponse.json({ message: banError.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("posts")
      .update({
        is_restricted: false,
      })
      .eq("id", postId);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { message: "不明な action です" },
    { status: 400 }
  );
}