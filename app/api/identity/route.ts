import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.session_id ?? body.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "セッション情報がありません。" },
        { status: 400 }
      );
    }

    // 以下そのまま

    const dayKey = getDayKey();

    const { data: existing } = await supabaseAdmin
      .from("daily_identities")
      .select("display_name, display_icon")
      .eq("session_id", sessionId)
      .eq("day_key", dayKey)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        name: existing.display_name,
        icon: existing.display_icon,
      });
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
        return NextResponse.json({
          name: data.display_name,
          icon: data.display_icon,
        });
      }

      if (error?.code !== "23505") {
        console.error("identity insert error:", error);
      }
    }

    return NextResponse.json(
      { error: "今日使える名前がなくなりました。" },
      { status: 409 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "名前の取得に失敗しました。" },
      { status: 500 }
    );
  }
}