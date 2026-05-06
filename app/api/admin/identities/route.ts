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

  const { data: names } = await supabaseAdmin
    .from("identity_names")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: icons } = await supabaseAdmin
    .from("identity_icons")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    names: names ?? [],
    icons: icons ?? [],
  });
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { type, value } = await request.json();

  if (!type || !value?.trim()) {
    return NextResponse.json({ message: "入力が空です" }, { status: 400 });
  }

  const table = type === "icon" ? "identity_icons" : "identity_names";
  const column = type === "icon" ? "icon" : "name";

  const { error } = await supabaseAdmin.from(table).insert({
    [column]: value.trim(),
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

  const { type, id, isActive } = await request.json();

  const table = type === "icon" ? "identity_icons" : "identity_names";

  const { error } = await supabaseAdmin
    .from(table)
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}