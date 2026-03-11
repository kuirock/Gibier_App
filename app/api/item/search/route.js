// app/api/item/search/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../utils/database";
import { ItemModel } from "../../../utils/schemaModels";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q'); // 検索キーワードを受け取るよ

    if (!q) {
        return NextResponse.json({ results: [] });
    }

    try {
        await connectDB();
        // title（店舗名）にキーワードが含まれるものを探すよ！最大5件まで！
        const items = await ItemModel.find({
            title: { $regex: q, $options: 'i' }
        }).limit(5);

        // descriptionの中にJSON形式で色々入ってるから、パースして使いやすくするね
        const results = items.map(item => {
            let details = {};
            try {
                details = JSON.parse(item.description);
            } catch (e) {
                details = { intro: item.description };
            }
            return {
                _id: item._id,
                title: item.title,
                price: item.price, // 住所が入ってる想定
                ...details
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        return NextResponse.json({ message: "検索に失敗しちゃった💦" }, { status: 500 });
    }
}