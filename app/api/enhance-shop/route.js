import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM = `
あなたは日本語の販促コピー編集者です。
入力の説明文を、読みやすく自然で、事実を変えず、誇大表現を避け、30〜120字程度で整えてください。
トーンは指示に従い、絵文字・顔文字は使わないでください。
`;

function buildPrompt(base, tone) {
    const toneInstr =
        tone === "luxury"
            ? "上質・高級感のある落ち着いたトーンで。語彙は丁寧・簡潔。"
            : tone === "casual"
                ? "カジュアルで親しみやすいトーン（庶民的）で。やさしい語彙で明快に。"
                : "標準的でニュートラルなトーンで。";

    return `元の説明文:\n${base}\n\n出力条件:\n- ${toneInstr}\n- 事実を書き換えない\n- 30〜120字\n- 一文または二文程度\n\n最終出力は本文のみ`;
}

async function createOne(genAI, base, tone) {
    // ✨ 最新の無料モデル「gemini-2.5-flash」を使うよ！ ✨
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM
    });

    const result = await model.generateContent(buildPrompt(base, tone));
    return result.response.text().trim();
}

export async function POST(req) {
    try {
        const form = await req.formData();
        const desc = (form.get("description") || "").toString();

        // Geminiの初期化
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        if (!desc) {
            return NextResponse.json({ message: "説明文が空だよ！" }, { status: 400 });
        }

        // 🌟 無料枠のパンクを防ぐために、3つのトーンを順番に生成するよ！
        const normal = await createOne(genAI, desc, "normal");
        const luxury = await createOne(genAI, desc, "luxury");
        const casual = await createOne(genAI, desc, "casual");

        return NextResponse.json({
            descs: { normal, luxury, casual }
        });

    } catch (e) {
        console.error("AI生成エラー:", e);
        return NextResponse.json({ message: "サーバーエラーが起きちゃった💦" }, { status: 500 });
    }
}