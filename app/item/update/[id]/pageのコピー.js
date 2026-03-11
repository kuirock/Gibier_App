"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ItemUpdatePage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // ① 初期表示：アイテム取得（サーバ側で所有者チェックも実施）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/item/update/${id}`, {
          credentials: "include", // ← Cookie 送る
        });
        const text = await res.text();
        let data = {};
        try { data = JSON.parse(text); } catch {}

        if (res.status === 200) {
          if (!cancelled) setItem(data.item);
        } else if (res.status === 401) {
          if (!cancelled) setMsg("未ログインです");
          router.push("/user/login");
          return;
        } else if (res.status === 403) {
          if (!cancelled) setMsg("更新権限がありません");
          return;
        } else {
          if (!cancelled) setMsg(data.message || `取得に失敗しました (${res.status})`);
          return;
        }
      } catch (e) {
        if (!cancelled) setMsg("通信エラーが発生しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, router]);

  // ② 更新送信
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      image: form.get("image"),
      price: form.get("price"),
//      price: Number(form.get("price")),
    };

    try {
      const res = await fetch(`/api/item/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← Cookie 送る
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (res.status === 200) {
        setMsg("更新しました");
//        router.push(`/item/${id}`); // 詳細ページなどに戻す
        router.push(`../../`); // 詳細ページなどに戻す
      } else if (res.status === 401) {
        setMsg("未ログインです");
        router.push("/user/login");
      } else if (res.status === 403) {
        setMsg("更新権限がありません");
      } else {
        setMsg(data.message || `更新に失敗しました (${res.status})`);
      }
    } catch {
      setMsg("通信エラーが発生しました");
    }
  }

  if (loading) return <p style={{ padding: 16 }}>読み込み中...</p>;
  if (!item) return <p style={{ padding: 16 }}>{msg || "データがありません"}</p>;

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <h1>アイテム編集</h1>
      {msg && <p>{msg}</p>}

      <form onSubmit={handleSubmit}>
        <label>タイトル</label>
        <input name="title" defaultValue={item.title} required />

        <label>価格</label>
        <input name="price" type="text" defaultValue={item.price} required />

        <label>画像URL</label>
        <input name="image" defaultValue={item.image} />

        <label>説明</label>
        <textarea name="description" defaultValue={item.description} />

        <button type="submit">保存</button>
      </form>
    </div>
  );
}
