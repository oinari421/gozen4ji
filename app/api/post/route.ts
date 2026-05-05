import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getClientIp, hashIp } from "@/lib/session";
import { validatePostText } from "@/lib/validation";
import { getJapanNow } from "@/lib/time";
import { icons, names } from "@/lib/identityPool";

function getDayKey() {
  const now = getJapanNow();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

async function getOrCreateIdentity(sessionId: string, dayKey: string) {
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("daily_identities")
    .select("display_name, display_icon")
    .eq("session_id", sessionId)
    .eq("day_key", dayKey)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return existing;
  }

  const shuffledNames = [...names].sort(() => Math.random() - 0.5);

  for (const name of shuffledNames) {
    const icon = pickRandom(icons);

    const { data, error } = await supabaseAdmin
      .from("daily_identities")
      .insert({
        session_id: sessionId,
        day_key: dayKey,
        display_name: name,
        display_icon: icon,
      })
      .select("display_name, display_icon")
      .single();

    if (!error && data) {
      return data;
    }

    if (error?.code !== "23505") {
      throw error;
    }
  }

  throw new Error("今日使える名前がなくなりました。");
}

async function checkBan(ipHash: string) {
  const now = new Date().toISOString();

  const { data: ban, error } = await supabaseAdmin
    .from("banned_ips")
    .select("id, ban_type, expires_at, status")
    .eq("ip_hash", ipHash)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!ban) {
    return null;
  }

  if (ban.ban_type === "temporary") {
    if (!ban.expires_at) {
      return ban;
    }

    if (new Date(ban.expires_at).toISOString() <= now) {
      await supabaseAdmin
        .from("banned_ips")
        .update({ status: "inactive" })
        .eq("id", ban.id);

      return null;
    }

    return ban;
  }

  return ban;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const text = body.text;
    const sessionId = body.sessionId ?? body.session_id;

    if (!sessionId) {
      return NextResponse.json(
        { error: "セッション情報がありません。" },
        { status: 400 }
      );
    }

    const errorMessage = validatePostText(text);

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const dayKey = getDayKey();
    const identity = await getOrCreateIdentity(sessionId, dayKey);

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const activeBan = await checkBan(ipHash);

    if (activeBan) {
      if (activeBan.ban_type === "temporary") {
        return NextResponse.json(
          { error: "現在、一定期間投稿が制限されています。" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "このユーザーは投稿できません。" },
        { status: 403 }
      );
    }

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

    const now = getJapanNow();
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
      display_name: identity.display_name,
      display_icon: identity.display_icon,
      is_deleted: false,
    });

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("post api error:", e);

    return NextResponse.json(
      { error: "投稿に失敗しました。" },
      { status: 500 }
    );
  }
}