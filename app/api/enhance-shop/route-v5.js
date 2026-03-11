// app/api/enhance-shop/route.js
import { NextResponse } from "next/server";
//import connectDB from "../../utils/database";
import OpenAI from "openai";

// Edge/Node どちらでも動く簡易版。必要なら runtime 指定を。
// export const runtime = "edge";

const SYSTEM = `
あなたは日本語の販促コピー編集者です。
入力の説明文を、読みやすく自然で、事実を変えず、誇大表現を避け、30〜120字程度で整えてください。
トーンは指示に従い、絵文字・顔文字は使わないでください。
`;

function buildUserPrompt(base, tone) {
  const toneInstr =
    tone === "luxury"
      ? "上質・高級感のある落ち着いたトーンで。語彙は丁寧・簡潔。"
      : tone === "casual"
        ? "カジュアルで親しみやすいトーン（庶民的）で。やさしい語彙で明快に。"
        : "標準的でニュートラルなトーンで。";
  return `元の説明文:\n${base}\n\n出力条件:\n- ${toneInstr}\n- 事実を書き換えない\n- 30〜120字\n- 一文または二文程度\n\n最終出力は本文のみ`;
}

async function createOne(openai, base, tone) {
  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: buildUserPrompt(base, tone) },
    ],
    temperature: 0.6,
    max_tokens: 200,
  });
  return res.choices?.[0]?.message?.content?.trim() || "";
}

async function fileToDataUrl(file) {
  const bytes = await file.arrayBuffer();
  const b64 = Buffer.from(bytes).toString("base64");
  // 拡張子の判定が必要なら file.type を利用
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${b64}`;
}

export async function POST(req) {
  try {
    console.log("APIキー読み込めてる？:", process.env.OPENAI_API_KEY);
    const form = await req.formData();
    const desc = (form.get("description") || "").toString();
    const imageFile = form.get("image"); // optional File
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!desc) {
      return NextResponse.json({ message: "description is required" }, { status: 400 });
    }

    // ---- 説明文：3トーン並列生成 ----
    const [normal, luxury, casual] = await Promise.all([
      createOne(openai, desc, "normal"),
      createOne(openai, desc, "luxury"),
      createOne(openai, desc, "casual"),
    ]);

    // ---- 画像処理（プレースホルダ）----
    // 既存のAIレタッチ実装がある場合は、ここを置き換えて imageUrl を作ってください。
    let imageUrl = "";
    if (imageFile && typeof imageFile === "object") {
      imageUrl = await fileToDataUrl(imageFile);
    }

    return NextResponse.json({
      descs: { normal, luxury, casual },
      imageUrl,
      // warn: "画像レタッチは現在の課金設定で無効です。" // 必要に応じて
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e?.message || "server error" }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  // DB操作…
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
