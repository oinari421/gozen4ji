import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function checkAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

// ------------------
// GET: 一覧
// ------------------
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("themes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ themes: [] });
  }

  return NextResponse.json({ themes: data ?? [] });
}

// ------------------
// POST: 追加
// ------------------
export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { text, targetDate } = await request.json();

  if (!text) {
    return NextResponse.json({ message: "text required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("themes").insert({
    text,
    target_date: targetDate,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ------------------
// PATCH: 有効化
// ------------------
export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  // 全てOFF
  await supabaseAdmin
    .from("themes")
    .update({ is_active: false })
    .neq("id", "none");

  // 対象だけON
  const { error } = await supabaseAdmin
    .from("themes")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}