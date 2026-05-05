import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getBaseSessionId(sessionId: string) {
  return sessionId.replace(/_\d{4}-\d{2}-\d{2}$/, "");
}

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select(`
      session_id,
      ip_hash,
      created_at,
      display_name,
      display_icon
    `);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  const posts = data ?? [];

  const userMap = new Map<
    string,
    {
      session_id: string;
      base_session_id: string;
      latest_session_id: string;
      ip_hash: string | null;
      post_count: number;
      latest_post_at: string;
      display_name: string | null;
      display_icon: string | null;
    }
  >();

  for (const post of posts) {
    const baseSessionId = getBaseSessionId(post.session_id);

    if (!userMap.has(baseSessionId)) {
      userMap.set(baseSessionId, {
        session_id: baseSessionId,
        base_session_id: baseSessionId,
        latest_session_id: post.session_id,
        ip_hash: post.ip_hash,
        post_count: 0,
        latest_post_at: post.created_at,
        display_name: post.display_name ?? null,
        display_icon: post.display_icon ?? null,
      });
    }

    const user = userMap.get(baseSessionId)!;

    user.post_count += 1;

    if (new Date(post.created_at) > new Date(user.latest_post_at)) {
      user.latest_post_at = post.created_at;
      user.latest_session_id = post.session_id;
      user.display_name = post.display_name ?? user.display_name;
      user.display_icon = post.display_icon ?? user.display_icon;
      user.ip_hash = post.ip_hash ?? user.ip_hash;
    }
  }

  const users = Array.from(userMap.values()).sort(
    (a, b) => b.post_count - a.post_count
  );

  return NextResponse.json({
    totalUsers: users.length,
    users,
  });
}