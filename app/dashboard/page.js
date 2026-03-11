"use client";

import useAuth from "@/app/utils/useAuth";

export default function DashboardPage() {
  const { user, loading, authenticated } = useAuth();

  if (loading) return <p style={{ padding: 16 }}>読み込み中...</p>;

  if (!authenticated) {
    // クライアント側では無理にリダイレクトしない（middleware が守ってくれる）
    return (
      <div style={{ padding: 16 }}>
        <h2>ログインが必要です</h2>
        <a href="/user/login">ログインページへ</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{user?.email ?? "ユーザー"} さん！</p>

      {/* 例: 認証が必要なAPIを叩くときは credentials: "include" */}
      <button
        onClick={async () => {
          const res = await fetch("/api/item/list", {
            credentials: "include", // ← Cookie を送る
          });
          const data = await res.json().catch(() => ({}));
          alert(`API status: ${res.status}\n${JSON.stringify(data)}`);
        }}
      >
        アイテム読み込みテスト
      </button>
    </div>
  );
}
