"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../../utils/useAuth";
import "./style.css"


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
  // 基本項目
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // 住所など任意の文字列を格納
  const [image, setImage] = useState("");

  // 元の説明文・元画像プレビュー
  const [originalDesc, setOriginalDesc] = useState("");
  const [originalImgPreview, setOriginalImgPreview] = useState(null);

  // /api/enhance-shop の実行結果
  // 形: { descs: { normal, luxury, casual }, imageUrl, warn? }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // どれを登録するか（"original" | "normal" | "luxury" | "casual"）
  const [selectedTone, setSelectedTone] = useState("normal");

  // 登録系
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  const router = useRouter();
  const loginUserEmail = useAuth(); // ログインユーザーのメール（既存フックを想定）

  // AI補正実行
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    // 3トーン生成のフラグ（将来拡張向けのダミー）
    formData.set("multi", "1");

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
        // 既定は通常文（必要なら "original" に）
        setSelectedTone("normal");
      } catch (err) {
        setError(err?.message ?? "失敗しました");
      }
    });
  }

  // 登録
  async function handleRegister() {
    try {
      if (!loginUserEmail) {
        setRegisterMessage("ログイン状態を確認してください。");
        return;
      }
      setIsRegistering(true);
      setRegisterMessage("登録処理中...");

      const imageForDb = result?.imageUrl || image || "";

      // 選択トーンに応じて説明文を決定
      const finalDesc =
        selectedTone === "original"
          ? originalDesc
          : (result?.descs?.[selectedTone] ??
             result?.descs?.normal ??
             result?.desc /* 旧フィールド互換 */ ??
             originalDesc);

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/item/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined" ? `Bearer ${localStorage.getItem("token") || ""}` : "",
        },
        body: JSON.stringify({
          title,
          price,
          image: imageForDb,
          description: finalDesc,
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
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        店舗登録ページ：画像と説明文のAI補正
      </h1>
      <p className="mt-2 text-gray-600 text-sm">
        <b>元の説明文</b>を含む4つ（元文/通常/高級/カジュアル）から1つ選んで、そのまま登録できます。
      </p>

      {/* 入力＆AI補正フォーム（結果がまだ無いときだけ表示） */}
      {!result && (
        <>
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
            <label className="text-sm font-medium">住所（または価格欄を流用）</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="text"
              name="price"
              placeholder="住所（任意の文字列でOK）"
              className="rounded-2xl border px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid gap-2 hide">
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
          <div className="grid gap-2 ai-image">
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
              // eslint-disable-next-line @next/next/no-img-element
              <img src={originalImgPreview} alt="original preview" className="mt-2 w-full rounded-2xl border" />
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">元の説明文（日本語）</label>
            <textarea
              name="description"
              rows={'5'}
              value={originalDesc}
              onChange={(e) => setOriginalDesc(e.target.value)}
              className="min-h-[320px] rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="例）地元猟師が届ける新鮮なエゾシカを使ったハンバーガーです。..."
              required
            />
            <p className="text-xs text-gray-500">
              文章は「通常 / 高級感 / カジュアル（庶民的）」の3トーンに加え、<b>元の説明文</b>も選べます。
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
            <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
        </form>
        </>
      )}

      {/* 補正結果（resultが存在するときだけ表示） */}
      {result && (
        <section className="mt-10 grid gap-4">
          <h2 className="text-xl font-semibold">補正結果（4つから選択）</h2>

          <div className="grid gap-6">
            {/* 画像結果 */}
            <div className="grid gap-3 ai-image">
              <h3 className="text-sm font-medium text-gray-600">補正後の画像</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.imageUrl} alt="improved" className="w-full rounded-2xl border shadow" />
              {result.imageUrl && (
                <a href={result.imageUrl} download className="text-xs text-gray-600 underline mt-1 inline-block">
                  画像をダウンロード
                </a>
              )}
            </div>

            {/* 説明文（元文 + 3トーン） */}
            <div className="grid md:grid-cols-4 gap-3 text-sm result">
              {[
                { key: "original", label: "元の説明文", content: originalDesc },
                { key: "normal", label: "通常", content: result?.descs?.normal },
                { key: "luxury", label: "高級感", content: result?.descs?.luxury },
                { key: "casual", label: "カジュアル（庶民的）", content: result?.descs?.casual },
              ].map((opt) => (
                <label key={opt.key} className="rounded-2xl border p-3 bg-white cursor-pointer group">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-medium text-gray-700">{opt.label}</span>
                    <input
                      type="radio"
                      name="tone"
                      value={opt.key}
                      checked={selectedTone === opt.key}
                      onChange={() => setSelectedTone(opt.key)}
                      className="accent-gray-900"
                    />
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed min-h-[4.5rem]">
                    {opt.content || "—"}
                  </div>
                </label>
              ))}
            </div>

            {/* 警告（API 側が warn を返す場合） */}
            {result.warn && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                {result.warn}
              </div>
            )}

            {/* ✅ 登録 */}
            <div className="mt-2 flex flex-col items-center gap-3">
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="rounded-2xl bg-emerald-600 px-6 py-2 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-40"
              >
                {isRegistering ? "登録中..." : "この内容で登録"}
              </button>
              <p className="text-xs text-gray-500">
                ※選択中：
                {selectedTone === "original"
                  ? "元の説明文"
                  : selectedTone === "normal"
                  ? "通常"
                  : selectedTone === "luxury"
                  ? "高級感"
                  : "カジュアル（庶民的）"}
              </p>
              {registerMessage && <p className="text-sm text-gray-700">{registerMessage}</p>}
            </div>
          </div>

        </section>
      )}
    </div>
  );
}
