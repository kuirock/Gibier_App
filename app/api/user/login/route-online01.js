import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import connectDB from "../../../utils/database";
import { UserModel } from "../../../utils/schemaModels";

export async function POST(request) {
  try {
    const reqBody = await request.json();
    await connectDB();

    // ユーザー検索
    const savedUserData = await UserModel.findOne({ email: reqBody.email });
    if (!savedUserData) {
      return NextResponse.json(
        { message: "ユーザー登録がありません" },
        { status: 401 }
      );
    }

    // パスワードチェック
    if (reqBody.password !== savedUserData.password) {
      return NextResponse.json(
        { message: "パスワードが違います" },
        { status: 401 }
      );
    }

    // ✅ JWT発行
    const secretKey = new TextEncoder().encode("next-market-app-book");
    const token = await new SignJWT({ sub: String(savedUserData._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    // ✅ Cookieをレスポンスにセット
    const response = NextResponse.json({
      message: "ログイン成功",
      token,
    });

    // 開発中（HTTPアクセス）の場合は Secure を削除してOK
    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800`
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "ログイン失敗" },
      { status: 500 }
    );
  }
}
