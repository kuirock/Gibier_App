"use client";

import React, { useState, useTransition } from "react";

function Spinner() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      処理中...
    </div>
  );
}

export default function EnhanceShopPage() {
  const [originalDesc, setOriginalDesc] = useState("");
  const [originalImgPreview, setOriginalImgPreview] = useState(null);
  const [result, setResult] = useState(null); // { desc, imageUrl, warn }
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // 仮登録用
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

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

  // 「これで登録」ボタン押下時の仮処理
  async function handleRegister() {
    try {
      setIsRegistering(true);
      setRegisterMessage("登録処理中...");

      // ここで実際の登録APIなどを呼び出す処理を記述
      // 例：
      // await fetch("/api/shop/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     imageUrl: result.imageUrl,
      //     description: result.desc,
      //   }),
      // });

      // デモ用
      await new Promise((r) => setTimeout(r, 1200));

      setRegisterMessage("✅ 登録が完了しました！");
    } catch (e) {
      setRegisterMessage("❌ 登録に失敗しました");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        店舗登録ページ：画像と説明文のAI補正
      </h1>
      <p className="mt-2 text-gray-600 text-sm">
        既存の「./shop/page.js」の画像と説明文をアップロード／貼り付けし、ChatGPTで補正した結果を表示します。
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium">店舗画像（JPG/PNG）</label>
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
            required
          />
          {originalImgPreview && (
            <img
              src={originalImgPreview}
              alt="original preview"
              className="mt-2 w-full rounded-2xl border"
            />
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">元の説明文（日本語）</label>
          <textarea
            name="description"
            required
            value={originalDesc}
            onChange={(e) => setOriginalDesc(e.target.value)}
            className="min-h-[120px] rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="例）地元猟師が届ける新鮮なエゾシカを使ったハンバーガーです。..."
          />
          <p className="text-xs text-gray-500">
            文章は自然で読みやすく、販促に適したトーンへ補正します。
          </p>
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
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </form>

      {result && (
        <section className="mt-10 grid gap-4">
          <h2 className="text-xl font-semibold">補正結果</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 左：画像 */}
            <div className="grid gap-3">
              <h3 className="text-sm font-medium text-gray-600">補正後の画像</h3>
              <img
                src={result.imageUrl}
                alt="improved"
                className="w-full rounded-2xl border shadow"
              /><br/>
              <a
                href={result.imageUrl}
                download
                className="text-xs text-gray-600 underline"
              >
                画像をダウンロード
              </a>
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

          {/* ⚠️ 警告表示（課金リミット時） */}
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
            {registerMessage && (
              <p className="text-sm text-gray-700">{registerMessage}</p>
            )}
          </div>
        </section>
      )}

      <footer className="mt-14 text-xs text-gray-500">
        参考： nextbook fullstack app router のUI構成に合わせつつ、フォーム送信中はローディングを表示します。
      </footer>
    </div>
  );
}
