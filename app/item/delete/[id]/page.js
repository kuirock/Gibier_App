"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function ItemDeletePage() {
  const router = useRouter();
  const { id } = useParams();
  const [msg, setMsg] = useState("");

  async function handleDelete() {
    setMsg("");
    try {
      const res = await fetch(`/api/item/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // ← Cookieを送る
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (res.status === 200) {
        setMsg("削除しました");
        router.push("/dashboard"); // お好みの遷移先に
      } else if (res.status === 401) {
        setMsg("未ログインです");
        router.push("/user/login");
      } else if (res.status === 403) {
        setMsg("削除権限がありません");
      } else {
        setMsg(data.message || `削除に失敗しました (${res.status})`);
      }
    } catch {
      setMsg("通信エラーが発生しました");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>アイテム削除</h1>
      <p>このアイテム（ID: {id}）を削除します。よろしいですか？</p>
      {msg && <p>{msg}</p>}
      <button onClick={handleDelete}>削除する</button>
      <button onClick={() => router.back()} style={{ marginLeft: 8 }}>やめる</button>
    </div>
  );
}
