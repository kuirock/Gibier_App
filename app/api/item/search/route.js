// app/api/item/search/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../utils/database-local";
import mongoose from "mongoose";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ results: [] });
    }

    try {
        await connectDB();

        const db = mongoose.connection.useDb('gibier_app');
        const shopsCollection = db.collection('shops');

        const items = await shopsCollection.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { "店名": { $regex: q, $options: 'i' } }
            ]
        }).limit(5).toArray();

        // 🌟 Promise.allを使って、見つかったお店ごとに郵便番号を裏側で取得するよ！
        const results = await Promise.all(items.map(async (item) => {
            let details = {};
            try {
                if (item.description && typeof item.description === 'string') {
                    details = JSON.parse(item.description);
                } else if (item.description) {
                    details = item.description;
                }
            } catch (e) {
                details = { intro: String(item.description) };
            }

            // --- 住所の分割と郵便番号取得をサーバー側でやっちゃう！ ---
            const rawAddress = item.price || item.場所 || "";
            const fullAddress = rawAddress.replace(/[\s　]+/g, "");
            const match = fullAddress.match(/^(北海道|東京都|(?:京都|大阪)府|.{2,3}県)(.*?市.*?区|.*?郡.*?町|.*?郡.*?村|.*?[市区町村])(.*)$/);

            let prefecture = "";
            let city = "";
            let street = fullAddress;
            let postal = "";

            if (match) {
                prefecture = match[1] || "";
                city = match[2] || "";
                street = match[3] || "";

                const searchAddress = prefecture + city + (street.split(/[0-9０-９\-ー]/)[0] || "");
                // サーバーからZIPCODAを叩く！（これならCORSエラーにならない✨）
                try {
                    const zipRes = await fetch(`https://zipcoda.net/api?address=${encodeURIComponent(searchAddress)}`);
                    if (zipRes.ok) {
                        const zipData = await zipRes.json();
                        if (zipData.items && zipData.items.length > 0) {
                            postal = zipData.items[0].zipcode;
                        }
                    }
                } catch (e) {
                    console.log("郵便番号検索エラー(無視してOK):", e);
                }
            }

            return {
                _id: item._id,
                title: item.title || item.店名 || "",
                price: rawAddress,
                prefecture: prefecture, // 👈 分割した住所と郵便番号も一緒にフロントに送る！
                city: city,
                street: street,
                postal: postal,
                category: item['ジャンル・取り扱ってるもの'] || "",
                url: item.URL || "",
                ...details
            };
        }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error("🚨 検索エラー:", error);
        return NextResponse.json({ message: "検索に失敗しちゃった💦" }, { status: 500 });
    }
}