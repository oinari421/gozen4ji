import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getBaseSessionId(sessionId: string) {
  return sessionId.replace(/_\d{4}-\d{2}-\d{2}$/, "");
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { message: "sessionId required" },
      { status: 400 }
    );
  }

  const baseSessionId = getBaseSessionId(sessionId);

  const { data: posts, error: postsError } = await supabaseAdmin
    .from("posts")
    .select("*")
    .like("session_id", `${baseSessionId}_%`)
    .order("created_at", { ascending: false });

  if (postsError) {
    return NextResponse.json(
      { message: postsError.message },
      { status: 500 }
    );
  }

  const { data: identities, error: identitiesError } = await supabaseAdmin
    .from("daily_identities")
    .select("day_key, session_id, display_name, display_icon")
    .like("session_id", `${baseSessionId}_%`)
    .order("day_key", { ascending: false });

  if (identitiesError) {
    return NextResponse.json(
      { message: identitiesError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    baseSessionId,
    posts: posts ?? [],
    identities: identities ?? [],
  });
}