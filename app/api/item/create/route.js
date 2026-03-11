// app/api/item/create/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "../../../utils/database";
import { ItemModel } from "../../../utils/schemaModels";

export async function POST(req) {
  try {
    // --- 1️⃣ Cookieからトークン取得 ---
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "未ログインです" }, { status: 401 });
    }

    // --- 2️⃣ トークンを検証 ---
    const secret = new TextEncoder().encode("next-market-app-book"); // login時と同じキー！
    const { payload } = await jwtVerify(token, secret);

    // --- 3️⃣ リクエスト本文を取得 ---
    const body = await req.json();

    // --- 4️⃣ DB接続 ---
    await connectDB();

    // --- 5️⃣ データ登録 ---
    const newItem = await ItemModel.create({
      title: body.title,
      price: body.price,
      image: body.image,
      description: body.description,
      email: payload.email, // JWTの中のemailを使う
      userId: payload.sub,
    });

    return NextResponse.json(
      { message: "登録が完了しました", item: newItem },
      { status: 200 }
    );

  } catch (err) {
    console.error("登録エラー:", err);
    return NextResponse.json(
      { message: "登録に失敗しました", error: String(err) },
      { status: 500 }
    );
  }
}
