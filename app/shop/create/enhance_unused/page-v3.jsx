"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
// ↓ プロジェクトの配置に合わせて調整（例: src/utils/useAuth など）
import useAuth from "../../../utils/useAuth";

function Spinner() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      処理中...
    </div>
  );
}

export default function EnhanceShopPage() {
  // もとの page.js と同じフィールドを持つ
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(""); // 画像URL文字列（もとの仕様に合わせる）

  const [originalDesc, setOriginalDesc] = useState("");
  const [originalImgPreview, setOriginalImgPreview] = useState(null);

  const [result, setResult] = useState(null); // { desc, imageUrl, warn }
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  const router = useRouter();
  const loginUserEmail = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    // 画像は file アップロード→AIレタッチ、説明文はテキスト→校正
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await fetch("/api/enhance-shop", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "API error");
        }
        const json = await res.json();
        setResult(json);
      } catch (err) {
        setError(err?.message ?? "失敗しました");
      }
    });
  }

  // これで登録：既存の DB 登録 API に投げる（もとの page.js に合わせる）
  async function handleRegister() {
    try {
      if (!loginUserEmail) {
        setRegisterMessage("ログイン状態を確認してください。");
        return;
      }
      setIsRegistering(true);
      setRegisterMessage("登録処理中...");

      // 画像は、AIレタッチの data:URL があればそれを優先。なければ手入力の image を使う。
      const imageForDb = result?.imageUrl || image || "";
      const improvedDesc = result?.desc || originalDesc;

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/item/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
        },
        body: JSON.stringify({
          title: title,
          price: price,
          image: imageForDb,
          description: improvedDesc, // ← 補正後のテキストを保存
          email: loginUserEmail,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "登録失敗");

      setRegisterMessage(json?.message || "✅ 登録が完了しました！");
      router.push("/");
      router.refresh();
    } catch (e) {
      setRegisterMessage(`❌ 登録に失敗しました: ${e?.message || e}`);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 screen">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">店舗登録ページ：画像と説明文のAI補正</h1>
      <p className="mt-2 text-gray-600 text-sm">補正結果をそのまま登録できます。</p>

      {/* もとの page.js と同じ入力フィールド */}
      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium">店舗名</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            name="title"
            placeholder="店舗名"
            className="rounded-2xl border px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">住所</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="text"
            name="price"
            placeholder="住所"
            className="rounded-2xl border px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">画像URL（任意：AIレタッチ結果があればそちらを保存）</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            type="text"
            name="image"
            placeholder="画像URL（未入力でもAIレタッチの結果を使えます）"
            className="rounded-2xl border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* AI補正フォーム */}
      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium">AIレタッチ用の元画像（JPG/PNG）</label>
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg"
            className="file:mr-4 file:rounded-xl file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-white file:text-sm file:shadow-sm file:hover:opacity-90 block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setOriginalImgPreview(URL.createObjectURL(f));
              else setOriginalImgPreview(null);
            }}
          />
          {originalImgPreview && (
            <img src={originalImgPreview} alt="original preview" className="mt-2 w-full rounded-2xl border" />
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">元の説明文（日本語）</label>
          <textarea
            name="description"
            value={originalDesc}
            onChange={(e) => setOriginalDesc(e.target.value)}
            className="min-h-[120px] rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="例）地元猟師が届ける新鮮なエゾシカを使ったハンバーガーです。..."
            required
          />
          <p className="text-xs text-gray-500">文章は自然で読みやすく、販促に適したトーンへ補正します。</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-gray-900 px-5 py-2 text-white text-sm shadow hover:opacity-90 disabled:opacity-40"
            disabled={isPending}
          >
            補正を実行
          </button>
          {isPending && <Spinner />}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
      </form>

      {result && (
        <section className="mt-10 grid gap-4">
          <h2 className="text-xl font-semibold">補正結果</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 左：画像 */}
            <div className="grid gap-3">
              <h3 className="text-sm font-medium text-gray-600">補正後の画像</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="improved" className="w-full rounded-2xl border shadow" />
              <br/>
              <a href={result.imageUrl} download className="text-xs text-gray-600 underline">画像をダウンロード</a>
            </div>

            {/* 右：説明文比較 */}
            <div className="grid gap-3">
              <h3 className="text-sm font-medium text-gray-600">説明文の比較</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border p-3 bg-gray-50">
                  <p className="font-medium text-gray-700 mb-1">元の説明文</p>
                  <div className="whitespace-pre-wrap">{originalDesc}</div>
                </div>
                <div className="rounded-2xl border p-3 bg-white">
                  <p className="font-medium text-gray-700 mb-1">補正後</p>
                  <div className="whitespace-pre-wrap">{result.desc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 警告表示（課金リミット時） */}
          {result.warn && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              {result.warn} 課金設定（Limits）を回復するとレタッチが有効になります。
            </div>
          )}

          {/* ✅ これで登録ボタン */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="rounded-2xl bg-emerald-600 px-6 py-2 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-40"
            >
              {isRegistering ? "登録中..." : "✅ これで登録"}
            </button>
            {registerMessage && <p className="text-sm text-gray-700">{registerMessage}</p>}
          </div>
        </section>
      )}

      <footer className="mt-14 text-xs text-gray-500">
        参考： nextbook fullstack app router のUI構成に合わせつつ、フォーム送信中はローディングを表示します。
      </footer>
    </div>
  );
}
