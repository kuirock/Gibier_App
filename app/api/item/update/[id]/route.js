// app/api/item/update/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "../../../../utils/database";
import { ItemModel } from "../../../../utils/schemaModels";

const SECRET = new TextEncoder().encode("next-market-app-book"); // ← login で使った秘密鍵と同じ

// GET: 編集初期表示用（必要なければ削除）
export async function GET(req, { params }) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return NextResponse.json({ message: "未ログインです" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }

    await connectDB();
    const doc = await ItemModel.findById(id);
    if (!doc) return NextResponse.json({ message: "対象が見つかりません" }, { status: 404 });

    const isOwner =
      (doc.userId && String(doc.userId) === String(payload.sub)) ||
      (doc.email && doc.email === payload.email);

    if (!isOwner) return NextResponse.json({ message: "更新権限がありません" }, { status: 403 });

    return NextResponse.json({ item: doc }, { status: 200 });
  } catch (e) {
    console.error("item update GET error:", e);
    return NextResponse.json({ message: "取得に失敗しました" }, { status: 500 });
  }
}

// PATCH: 更新実行
export async function PATCH(req, { params }) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return NextResponse.json({ message: "未ログインです" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }

    const body = await req.json();
    // 許可する項目だけ反映（サニタイズ）
    const update = {};
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.image === "string") update.image = body.image;
    if (typeof body.price !== "undefined") update.price = body.price;

    await connectDB();
    const doc = await ItemModel.findById(id);
    if (!doc) return NextResponse.json({ message: "対象が見つかりません" }, { status: 404 });

    const isOwner =
      (doc.userId && String(doc.userId) === String(payload.sub)) ||
      (doc.email && doc.email === payload.email);

    if (!isOwner) return NextResponse.json({ message: "更新権限がありません" }, { status: 403 });

    const updated = await ItemModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ message: "更新しました", item: updated }, { status: 200 });
  } catch (e) {
    console.error("item update PATCH error:", e);
    return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
  }
}
