import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function checkAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("ng_words")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ words: [] }, { status: 500 });
  }

  return NextResponse.json({ words: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { word, type } = await request.json();

  if (!word?.trim()) {
    return NextResponse.json(
      { message: "ワードを入力してください" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("ng_words").insert({
    word: word.trim(),
    type: type || "ng",
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, isActive } = await request.json();

  const { error } = await supabaseAdmin
    .from("ng_words")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}