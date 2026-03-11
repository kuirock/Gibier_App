// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/",
  "/user/login",
  "/user/register",
  "/api/user/login",
  "/api/auth/me",
];

const SECRET = new TextEncoder().encode("next-market-app-book");

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 公開パスはスルー
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Cookie 取得
  const token = req.cookies.get("token")?.value;
  const isApi = pathname.startsWith("/api/");

  // token がない → 未ログイン
  if (!token) {
    if (isApi) {
      // ← API呼び出しの場合は JSONで返す
      return NextResponse.json({ message: "未ログインです" }, { status: 401 });
    } else {
      // ← ページアクセスの場合はリダイレクト
      return NextResponse.redirect(new URL("/user/login", req.url));
    }
  }

  try {
    // JWT検証
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("middleware token verify error:", err);

    if (isApi) {
      // ★ APIリクエストにはJSONで返す（文言を統一）
      return NextResponse.json({ message: "権限がありません" }, { status: 403 });
    } else {
      return NextResponse.redirect(new URL("/user/login", req.url));
    }
  }
}

// 対象パス設定
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user/:path*",
    "/item/:path*",
    "/shop/:path*",
    "/api/:path*",
  ],
};
