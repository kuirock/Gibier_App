"use client";

import { useState } from "react";
import Link from "next/link";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          hokkaido-gibier
        </Link>

        {/* ハンバーガーボタン */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニューを開く"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ナビゲーション */}
        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link href="/user/register-g" onClick={() => setMenuOpen(false)}>
                登録
              </Link>
            </li>
            <li>
              <Link href="/user/login-g" onClick={() => setMenuOpen(false)}>
                ログイン
              </Link>
            </li>
            <li>
              <Link href="/shop/create/" onClick={() => setMenuOpen(false)}>
                店舗登録
              </Link>
            </li>
            <li>
              <Link href="/item/create" onClick={() => setMenuOpen(false)}>
                メニュー登録
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
