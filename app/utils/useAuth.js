// app/utils/useAuth.js
"use client";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);     // 例: { email, id } など
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // ← Cookie を送信
        });
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setUser(data.user || { email: data.email });
            setAuthenticated(true);
          } else {
            setUser(null);
            setAuthenticated(false);
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { user, loading, authenticated };
}
