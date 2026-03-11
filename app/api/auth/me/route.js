// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// ログイン確認用: Cookie "token" の JWT を検証し、200/401 を返す
export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ！！ログイン時の発行と同じ秘密鍵を使う！！
    const secret = new TextEncoder().encode("next-market-app-book");
    const { payload } = await jwtVerify(token, secret);

    // 必要に応じて payload から返したい情報を返す
    return NextResponse.json(
      { ok: true, email: payload.email || "", userId: payload.sub || "" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
