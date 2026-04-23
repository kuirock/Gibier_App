// app/api/ai-search/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../../utils/database";
import { ItemModel } from "../../utils/schemaModels";

export async function POST(req) {
    try {
        const body = await req.json();
        const userMessage = body.message;
        const location = body.location;

        // 🌟 改善ポイント：AIに「現在地からの行きやすさも調べて！」とお願いする
        let locationContext = "ユーザーの現在地は不明です。北海道内を基準に探してください。";
        if (location) {
            locationContext = `ユーザーの現在地は「緯度: ${location.lat}, 経度: ${location.lng}」です。この周辺（北海道内）でお店を探すとともに、現在地からの直線距離やおおよその移動時間（徒歩・車）も調べて教えてください。`;
        }

        // DBから情報を取得
        await connectDB();
        const items = await ItemModel.find();
        const shopInfo = items.map(item => `・店舗名: ${item.title} (住所: ${item.price}, 説明: ${item.description})`).join("\n");

        // Geminiの準備
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // 🌟 改善ポイント：ギャル全開＆嘘をつかない！アクセスとマップリンクも追加！
        const systemInstruction = `
        あなたはエゾシカ肉を提供するお店を案内する専用のAIコンシェルジュ「eDhi（エディ）」です。
        以下のルールを【絶対に】厳守してください。

        1. 口調: ギャルっぽく、可愛くて親しみやすい言葉遣いで話してください。（例：「〜だよね！」「〜でしょ✨」など）
        2. ハルシネーションの絶対禁止（最重要）: 
           - あなたの想像や不確かな知識でお店やURLを作り出すことは固く禁じます。
           - 必ず「提供されたデータベース」または「Google検索結果」にある【事実のみ】を出力してください。
           - わからないこと、見つからない場合は絶対に嘘をつかず「ごめん！見つからなかった🥺」と正直に答えてください。
           - できないことも「できない」と正直に伝えてください。
        3. URLとマップの出力ルール（誤リンクの徹底防止）:
           - 確実に北海道にあるその店舗の公式URLか確認してください。迷った場合は以下の検索用URLを出力してください。
           - 検索用URL: https://www.google.com/search?q=店舗名+市区町村名
        4. 現在地からのアクセス案内（重要）:
           - ユーザーの現在地（緯度・経度）と、お店の住所から、大体の移動時間（徒歩または車）を推測して教えてください。
           - 「ここからなら歩いて行けるよ！」「車で〇〇分くらいかな！」のように親切に案内してください。
        5. 提案件数: 条件に合うお店を【1〜3件】に絞ってください。
        
        6. 出力フォーマット（箇条書きを厳守）:
           **■ [店舗名]**
           ・**住所**：[詳細な住所]
           ・**アクセス**：[現在地からの距離感や行きやすさ（例：現在地から徒歩約10分、車で約15分など）]
           ・**URL**：[公式URL、または https://www.google.com/search?q=店舗名+市区町村名]
           ・**マップ**：[https://www.google.com/maps/search/?api=1&query=店舗名+市区町村名]
           ・**出店元**：[当サイトのデータベース or 検索元のサイト名]
           ・**特徴**：[エゾシカ肉に関する特徴やおすすめポイントをギャルっぽく！]
           
        ※見やすさ向上のため、上記のように項目名や店舗名、その他強調したい重要なキーワードは、必ず ** (アスタリスク2つ) で囲んで **太字** にしてください。
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }]
        });

        const prompt = `
        ${locationContext}

        【当サイトのデータベースにあるお店の情報（優先的に紹介してください）】
        ${shopInfo || "現在データベースにお店の情報はありません。"}
        
        ユーザーの質問: ${userMessage}
        `;

        const result = await model.generateContent(prompt);
        const aiMessage = result.response.text();

        return NextResponse.json({ message: aiMessage });

    } catch (e) {
        console.error("AIエラー:", e);
        return NextResponse.json({ message: "ごめんなさい、通信エラーが発生しました🥺" }, { status: 500 });
    }
}