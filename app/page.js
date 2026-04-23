"use client";
import Link from "next/link";

export default function Home() {
    return (
        <div className="home-container">
            {/* メインビジュアル＆検索 */}
            <section className="home-heroSection">
                <h1 className="home-heroTitle">（ウェブサイト名）</h1>
                <p className="home-heroSubtitle">
                    エゾシカ肉料理を提供するお店や、<br />
                    買えるお店がすぐに見つかります！
                </p>

                {/* 検索フォーム：/search にGETで遷移するよ！ */}
                <form action="/search" method="GET" className="home-searchForm">
                    <label className="home-searchLabel">キーワードから探す</label>
                    <div className="home-searchInputWrapper">
                        <input
                            type="text"
                            name="q"
                            className="home-searchInput"
                            placeholder="例：札幌、ハンバーガー"
                        />
                    </div>
                    <button type="submit" className="home-searchBtn">検索する</button>
                </form>

                <div>
                    <p className="home-locationText">
                        今いる場所の近くから探したい方、<br />
                        細かい条件を指定したい方はこちら
                    </p>
                    <Link href="#" className="home-locationButton" onClick={(e) => e.preventDefault()}>
                        現在地・条件から探す<br />（準備中）
                    </Link>
                </div>
            </section>

            {/* AI相談エリア */}
            <section className="home-aiSection">
                <p className="home-aiText">
                    おすすめのお店を知りたい！など<br />
                    会話形式でお店を探したい方は<br />
                    こちらをご利用いただけます。
                </p>
                {/* ▼ href を /ai-search に変更し、onClick を削除しました */}
                <Link href="/ai-search" className="home-aiButton">
                    AIに聞いてみる
                </Link>
            </section>

            {/* エゾシカ肉・飲食店を探す */}
            <section className="home-categorySection">
                <h2 className="home-sectionTitle">エゾシカ肉・飲食店を探す</h2>

                <Link href="#" className="home-card" onClick={(e) => e.preventDefault()}>
                    <div className="home-imagePlaceholder home-color1">
                        エゾシカ肉を<br />朝ごはんで食べる
                    </div>
                    <p className="home-cardDesc">朝から元気に！エゾシカ肉を使った<br />朝食メニューを提供するお店</p>
                </Link>

                <Link href="#" className="home-card" onClick={(e) => e.preventDefault()}>
                    <div className="home-imagePlaceholder home-color2">
                        キャンプ飯を食べる
                    </div>
                    <p className="home-cardDesc">大自然の中で！キャンプ場周辺の<br />テイクアウト可能なお店</p>
                </Link>

                <Link href="#" className="home-card" onClick={(e) => e.preventDefault()}>
                    <div className="home-imagePlaceholder home-color3">
                        おみやげを買う
                    </div>
                    <p className="home-cardDesc">旅の思い出に！エゾシカ肉の<br />加工品・特産品が買えるお店</p>
                </Link>
            </section>

            {/* 直売店・食肉加工工場の紹介 */}
            <section className="home-categorySection">
                <h2 className="home-sectionTitle">直売店・食肉加工工場の紹介</h2>

                <Link href="#" className="home-card" onClick={(e) => e.preventDefault()}>
                    <div className="home-imagePlaceholder home-color4">
                        飲食店で食べる
                    </div>
                    <p className="home-cardDesc">プロの味を堪能！こだわりの<br />エゾシカ料理を提供するお店</p>
                </Link>

                <Link href="#" className="home-card" onClick={(e) => e.preventDefault()}>
                    <div className="home-imagePlaceholder home-color5">
                        直売工場で買う
                    </div>
                    <p className="home-cardDesc">新鮮なエゾシカ肉を直接購入！<br />直売所・加工工場のご案内</p>
                </Link>
            </section>

            {/* おすすめ (ダミーデータ) */}
            <section className="home-categorySection">
                <h2 className="home-sectionTitle">おすすめ</h2>
                <div className="home-recommendList">
                    <div className="home-recommendCard">
                        <div className="home-dummyImg"></div>
                        <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "5px 0" }}>【ダミー】エゾシカハンバーガー店</h3>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>ジューシーな鹿肉パティが絶品！</p>
                    </div>
                    <div className="home-recommendCard">
                        <div className="home-dummyImg" style={{ backgroundColor: "#aeb9d1" }}></div>
                        <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "5px 0" }}>【ダミー】シカ肉ローストバル</h3>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>ワインに合う鹿肉ローストを提供。</p>
                    </div>
                </div>
            </section>
        </div>
    );
}