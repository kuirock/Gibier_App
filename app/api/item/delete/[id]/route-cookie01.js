// app/api/item/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "../../../utils/database";
import { ItemModel } from "../../../utils/schemaModels";
import mongoose from "mongoose";

export async function DELETE(req, { params }) {
  try {
    // 1) Cookieからトークン取得
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "未ログインです" }, { status: 401 });
    }

    // 2) JWT検証（ログイン発行時と同じ秘密鍵）
    const secret = new TextEncoder().encode("next-market-app-book");
    const { payload } = await jwtVerify(token, secret); // payload.sub がユーザーID/ emailがメール

    // 3) ID妥当性チェック
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }

    // 4) DB接続
    await connectDB();

    // 5) 対象取得（存在確認 & 所有者確認）
    const doc = await ItemModel.findById(id);
    if (!doc) {
      return NextResponse.json({ message: "対象が見つかりません" }, { status: 404 });
    }

    // 所有者チェック（どちらかで統一：userId or email）
    const isOwner =
      (doc.userId && String(doc.userId) === String(payload.sub)) ||
      (doc.email && doc.email === payload.email);

    if (!isOwner) {
      return NextResponse.json({ message: "削除権限がありません" }, { status: 403 });
    }

    // 6) 削除実行
    await ItemModel.findByIdAndDelete(id);
    return NextResponse.json({ message: "削除しました" }, { status: 200 });

  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
  }
}
