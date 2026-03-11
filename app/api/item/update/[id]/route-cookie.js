// app/api/item/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectDB from "../../../utils/database";
import { ItemModel } from "../../../utils/schemaModels";

const SECRET = new TextEncoder().encode("next-market-app-book"); // ← login発行と同じ

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
    // 変更を許可するフィールドだけ拾う（サニタイズ）
    const update = {};
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.image === "string") update.image = body.image;
    if (typeof body.price !== "undefined") update.price = body.price;

    await connectDB();

    const doc = await ItemModel.findById(id);
    if (!doc) return NextResponse.json({ message: "対象が見つかりません" }, { status: 404 });

    // 所有者チェック（保存時に userId と email のどちらを入れているかに合わせて）
    const isOwner =
      (doc.userId && String(doc.userId) === String(payload.sub)) ||
      (doc.email && doc.email === payload.email);

    if (!isOwner) {
      return NextResponse.json({ message: "更新権限がありません" }, { status: 403 });
    }

    const updated = await ItemModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ message: "更新しました", item: updated }, { status: 200 });
  } catch (err) {
    console.error("update error:", err);
    return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
  }
}
