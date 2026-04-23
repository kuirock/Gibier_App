"use client";
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchResult() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || ''; // トップから送られた検索キーワード

    // ダミーのリスト（6個分）
    const dummyItems = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        name: "商品・飲食店名他"
    }));

    return (
        <div className="search-page-container">
            {/* 赤いヘッダー */}
            <div className="search-header">
                <button className="search-backButton" onClick={() => router.back()}>←</button>
                <div className="search-pageTitle">検索</div>
                <button className="search-menuButton">≡</button>
            </div>

            {/* 検索窓 */}
            <div className="search-barContainer">
                <div className="search-inputWrapper">
                    <input
                        type="text"
                        className="search-input"
                        defaultValue={query}
                        placeholder="○○○○○○○○○"
                    />
                    <span style={{ color: "#999" }}>🔍</span>
                </div>
            </div>

            {/* 2列のグリッド（ダミー画像） */}
            <div className="search-gridContainer">
                {dummyItems.map((item) => (
                    <div key={item.id} className="search-gridItem">
                        <div className="search-dummyImage"></div>
                        <div className="search-itemText">{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}