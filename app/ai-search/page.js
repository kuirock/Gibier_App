// app/ai-search/page.js
"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 🌟 formatMessage をパワーアップ！ URLと太字(**)の両方に対応✨
const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
        // URL と **太字** の両方をキャッチする正規表現
        const regex = /(https?:\/\/[^\s\n。、]+)|\*\*(.*?)\*\*/g;
        const elements = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            // マッチした部分の前の「普通のテキスト」を追加
            if (match.index > lastIndex) {
                elements.push(line.substring(lastIndex, match.index));
            }

            if (match[1]) {
                // URLの場合の処理
                elements.push(
                    <a
                        key={`url-${match.index}`}
                        href={match[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0056b3', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                        {match[1]}
                    </a>
                );
            } else if (match[2]) {
                // 太字(**文字**)の場合の処理 💅えんじ色で強調！
                elements.push(
                    <strong key={`bold-${match.index}`} style={{ fontWeight: 'bold', color: '#8b3a3a' }}>
                        {match[2]}
                    </strong>
                );
            }
            lastIndex = regex.lastIndex;
        }

        // 残りの普通のテキストを追加
        if (lastIndex < line.length) {
            elements.push(line.substring(lastIndex));
        }

        return (
            <div key={i} style={{ minHeight: line === '' ? '1em' : 'auto', marginBottom: '4px' }}>
                {elements.length > 0 ? elements : line}
            </div>
        );
    });
};

export default function AiSearchChat() {
    const router = useRouter();

    const [messages, setMessages] = useState([
        { sender: "ai", text: "エゾシカ肉について、何をお探しですか？" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const messagesEndRef = useRef(null);

    // 🌟 サジェスト（よくある質問）のリスト
    const suggestKeywords = [
        "🍽️ 札幌で美味しいエゾシカ肉を食べたい！",
        "🍷 初心者でも食べやすいお店",
        "🏕️ キャンプで焼きたい！テイクアウトできるお店",
        "🎁 お土産にぴったりなエゾシカの加工品"
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // 位置情報の取得
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("位置情報が取得できませんでした:", error);
                },
                {
                    enableHighAccuracy: true, // 👈 これが超大事！GPSを本気で使って正確な場所を取る！
                    timeout: 10000,           // 10秒探して見つからなかったらエラーにする
                    maximumAge: 0             // 過去の古い場所の記憶（キャッシュ）を使わず、今の場所を取る！
                }
            );
        }
    }, []);

    // 🌟 サジェストボタンを押した時の処理
    const handleSuggestClick = async (keyword) => {
        if (isLoading) return;

        const newMessages = [...messages, { sender: "user", text: keyword }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: keyword,
                    location: userLocation
                }),
            });
            const data = await response.json();

            setMessages([...newMessages, { sender: "ai", text: data.message }]);
        } catch (error) {
            console.error("通信エラー:", error);
            setMessages([...newMessages, { sender: "ai", text: "ごめんなさい、通信エラーが発生しました。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    // テキストを入力して送信した時の処理
    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const newMessages = [...messages, { sender: "user", text: inputText }];
        setMessages(newMessages);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputText,
                    location: userLocation
                }),
            });
            const data = await response.json();

            setMessages([...newMessages, { sender: "ai", text: data.message }]);
        } catch (error) {
            console.error("通信エラー:", error);
            setMessages([...newMessages, { sender: "ai", text: "ごめんなさい、通信エラーが発生しました。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-chat-container">
            <div className="ai-chat-header">
                <button className="ai-chat-backButton" onClick={() => router.back()}>←</button>
                <div className="ai-chat-title">AI提案</div>
                <button className="ai-chat-menuButton">≡</button>
            </div>

            <div className="ai-chat-messageArea">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`ai-chat-row ${msg.sender === 'ai' ? 'ai-chat-row-ai' : 'ai-chat-row-user'}`}
                    >
                        {msg.sender === 'ai' && <div className="ai-chat-avatar"></div>}
                        <div className={msg.sender === 'ai' ? "ai-chat-bubble-ai" : "ai-chat-bubble-user"}>
                            {formatMessage(msg.text)}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="ai-chat-row ai-chat-row-ai">
                        <div className="ai-chat-avatar"></div>
                        <div className="ai-chat-bubble-ai">考え中...💭</div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 🌟 ここにサジェストチップを追加！入力欄のすぐ上に置くよ */}
            <div className="ai-chat-suggestArea">
                {suggestKeywords.map((keyword, index) => (
                    <button
                        key={index}
                        className="ai-chat-suggestChip"
                        onClick={() => handleSuggestClick(keyword)}
                        disabled={isLoading}
                    >
                        {keyword}
                    </button>
                ))}
            </div>

            <div className="ai-chat-inputArea">
                <textarea
                    className="ai-chat-input"
                    placeholder="メッセージを入力..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={1}
                    style={{ resize: "none", fontFamily: "inherit", paddingTop: "12px" }}
                    onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') {
                            if (e.shiftKey) {
                                return;
                            } else {
                                e.preventDefault();
                                handleSend();
                            }
                        }
                    }}
                />
                <button
                    className="ai-chat-sendBtn"
                    onClick={handleSend}
                    disabled={isLoading}
                >
                    送信
                </button>
            </div>
        </div>
    );
}