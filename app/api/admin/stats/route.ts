import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Post = {
  id: string;
  text: string;
  session_id: string;
  ip_hash: string | null;
  created_at: string;
  is_deleted: boolean;
  reply_count: number | null;
  empathy_count: number | null;
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const targetDate = date ?? new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });

  const start = new Date(`${targetDate}T00:00:00+09:00`);
  const end = new Date(`${targetDate}T00:00:00+09:00`);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const posts = (data ?? []) as Post[];

  const userMap = new Map<
    string,
    {
      session_id: string;
      ip_hash: string | null;
      post_count: number;
      latest_post_at: string;
    }
  >();

  for (const post of posts) {
    if (!userMap.has(post.session_id)) {
      userMap.set(post.session_id, {
        session_id: post.session_id,
        ip_hash: post.ip_hash,
        post_count: 0,
        latest_post_at: post.created_at,
      });
    }

    const user = userMap.get(post.session_id)!;
    user.post_count += 1;

    if (new Date(post.created_at) > new Date(user.latest_post_at)) {
      user.latest_post_at = post.created_at;
    }
  }

  const users = Array.from(userMap.values()).sort(
    (a, b) => b.post_count - a.post_count
  );

  return NextResponse.json({
    date: targetDate,
    totalPosts: posts.length,
    activePosts: posts.filter((p) => !p.is_deleted).length,
    deletedPosts: posts.filter((p) => p.is_deleted).length,
    userCount: users.length,
    users,
    posts,
  });
}