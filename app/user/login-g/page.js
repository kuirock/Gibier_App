"use client"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // ✅ Cookieを送受信できるように credentials: "include" を追加
      const res = await fetch(`/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ← ここがポイント！
      });

      const data = await res.json();

      if (res.ok) {
        alert("ログイン成功");
        console.log("token:", data.token);
        // ログイン後ページへリダイレクト
        window.location.href = "../";
      } else {
        alert(data.message || "ログイン失敗");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("通信エラーが発生しました");
    }
  }

  return (
    <div className="screen-login">

      <div className="p">
        <form onSubmit={handleSubmit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="メールアドレス" required /><br></br>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="パスワード" required /><br></br>
          <button>ログイン</button>
        </form>
      </div>


    </div>
  )
}
