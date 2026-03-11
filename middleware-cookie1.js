// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/",
  "/user/login",
  "/user/register",
  "/api/user/login",
  "/api/auth/me"
];

// JWTの秘密鍵（login/route.jsと一致させる）
const secretKey = new TextEncoder().encode("next-market-app-book");

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 公開パスならスルー
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Cookieからtokenを取得
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Cookieがない → 未ログイン
    const loginUrl = new URL("/user/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // JWT検証
    await jwtVerify(token, secretKey);
    return NextResponse.next(); // ← 成功時はそのまま通す
  } catch (err) {
    console.error("middleware token verify error:", err);
    const loginUrl = new URL("/user/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

// 対象パス設定
export const config = {
  matcher: ["/dashboard/:path*", "/user/:path*", "/item/:path*", "/shop/:path*"]
};
