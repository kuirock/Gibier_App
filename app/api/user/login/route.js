// app/api/user/login/route.js
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import connectDB from "../../../utils/database";
import { UserModel } from "../../../utils/schemaModels";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1) DB接続
    await connectDB();

    // 2) ユーザー検索
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "ユーザーが存在しません" }, { status: 401 });
    }

    // 3) パスワード照合（平文保存の場合の簡易版）
    // もしハッシュ化しているなら bcrypt.compare に変更してください。
    if (password !== user.password) {
      return NextResponse.json({ message: "パスワードが違います" }, { status: 401 });
    }

    // 4) JWT発行（※秘密鍵は他のAPIの検証と必ず同じ文字列）
    const secret = new TextEncoder().encode("next-market-app-book");
    const token = await new SignJWT({ sub: String(user._id), email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // 5) レスポンス作成 & Cookie 設定
    const res = NextResponse.json({ message: "ログイン成功" }, { status: 200 });

    // ★ 開発（HTTP）では SameSite=Lax / secure:false が安定
    //   本番（HTTPS）に上げるときは sameSite:"none", secure:true を推奨。
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",   // 開発HTTPではLaxが安定
      secure: false,     // 本番HTTPSでは true にする
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7日
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "ログイン失敗" }, { status: 500 });
  }
}
