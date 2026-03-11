import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// 認証を除外するパス
const PUBLIC_PATHS = ["/", "/user/login", "/user/register", "/api/user/login", "/api/auth/me"];

//export const config = { matcher: ["/dashboard/:path*", "/user/:path*", "/item/:path*"] };

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // パブリックパスはそのまま通す
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Cookieからtokenを取得
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // トークンがない場合はログインページへ
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  try {
    // JWT検証
    const secretKey = new TextEncoder().encode("next-market-app-book");
    await jwtVerify(token, secretKey);

    // ✅ Cookieの再設定で SameSite / Secure を明示
    // これにより、他マシンやHTTP環境でも安定動作
    const response = NextResponse.next();
    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
      httpOnly: true,
      sameSite: "none",  // LAN 内での別マシン通信に必要
      secure: false,     // HTTPSでないローカル開発なら false
      maxAge: 60 * 60 * 24 * 7, // 7日
    });
    return response;

  } catch (error) {
    console.error("JWT validation failed:", error);
    // トークンが無効・期限切れ → ログイン画面へ
    return NextResponse.redirect(new URL("/user/login", request.url));
  }
}

// middleware の適用範囲
/*export const config = {
  matcher: ["/user/:path*", "/product/:path*", "/dashboard/:path*"],
};*/
export const config = { matcher: ["/dashboard/:path*", "/user/:path*", "/item/:path*"] };
