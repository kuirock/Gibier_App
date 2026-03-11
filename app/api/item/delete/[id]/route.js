// app/api/item/delete/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "../../../../utils/database";
import { ItemModel } from "../../../../utils/schemaModels";

const SECRET = new TextEncoder().encode("next-market-app-book"); // ← login発行と同じキー

function isOwner(doc, payload) {
  return (
    (doc.userId && String(doc.userId) === String(payload.sub)) ||
    (doc.email && doc.email === payload.email)
  );
}

export async function DELETE(_req, { params }) {
  try {
    // 1) 認証（Cookieのtokenを検証）
    const token = cookies().get("token")?.value;
    if (!token) return NextResponse.json({ message: "未ログインです" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);

    // 2) ID妥当性
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }

    // 3) DB接続 & 取得
    await connectDB();
    const doc = await ItemModel.findById(id);
    if (!doc) return NextResponse.json({ message: "対象が見つかりません" }, { status: 404 });

    // 4) 所有者チェック
    if (!isOwner(doc, payload)) {
      return NextResponse.json({ message: "削除権限がありません" }, { status: 403 });
    }

    // 5) 削除実行
    await ItemModel.findByIdAndDelete(id);
    return NextResponse.json({ message: "削除しました" }, { status: 200 });

  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
  }
}
