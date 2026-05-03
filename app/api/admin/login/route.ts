import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  console.log("入力:", password);
  console.log("env:", process.env.ADMIN_PASSWORD);

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "パスワードが違います" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin_auth", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  return response;
}