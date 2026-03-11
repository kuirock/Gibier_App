"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../utils/useAuth';
import styles from './chat-style.module.css';

// SCENARIO定義
const SCENARIO = [
    { key: 'intro', type: 'bot', text: () => '最初に店舗の基本情報を登録をしていただきます！' },
    { key: 'swipe_guide', type: 'bot', text: () => 'こちらの対話形式ではなく、フォーム入力も可能です！ フォーム入力をしたい場合は左にスライドするか、下のボタンで切り替えてください。' },
    { key: 'title', type: 'question', field: 'title', text: () => 'まずはエゾシカ肉を取り扱っている店舗名を教えてください', buttonText: '店舗名を入力' },
    {
        key: 'manager_kanji',
        type: 'question',
        field: 'manager_kanji',
        text: () => '次に管理者名を【漢字】で教えてください。\n(例：山田 太郎)\n\n※姓と名の間にスペースを入れてください',
        buttonText: '姓と名をスペースで区切って入力'
    },
    {
        key: 'manager_kana',
        type: 'question',
        field: 'manager_kana',
        text: () => '管理者の【フリガナ】をカタカナで教えてください。\n(例：ヤマダ タロウ)',
        buttonText: 'セイとメイをスペースで区切って入力'
    },
    {
        key: 'contact_check',
        type: 'choice',
        field: 'contact_check',
        text: () => 'お問い合わせ先を入力してください。\n\nこれは任意です。飛ばす（スキップ）\nか入力するか選択してください',
        options: ['お問い合わせ先を入力する', 'スキップする'],
        buttonText: '選択肢から選ぶか入力'
    },
    { key: 'email', type: 'question', field: 'email', text: () => 'お問い合わせ先のメールアドレスを入力してください', skipCondition: (data) => data.contact_check === 'スキップする', buttonText: 'メールアドレスを入力' },
    { key: 'phone', type: 'question', field: 'phone', text: () => 'お問い合わせ先の電話番号（ハイフンなし）を入力してください', skipCondition: (data) => data.contact_check === 'スキップする', buttonText: '電話番号を入力' },
    {
        key: 'postal',
        type: 'question',
        field: 'postal',
        text: () => '店舗の郵便番号を教えてください（ハイフンなし7桁）。\n住所を自動で検索します！',
        buttonText: '1234567'
    },
    {
        key: 'street',
        type: 'question',
        field: 'street',
        text: (data) => `【${data.prefecture}${data.city}】ですね！\n\n続きの住所（番地・建物名・部屋番号）を入力してください。\n(例：1-2-1 パークハイツ 101号室)`,
        buttonText: '番地・建物名を入力'
    },
    {
        key: 'time',
        type: 'question',
        field: 'time',
        text: () => '営業時間を教えてください。\n※24時間表記\n\n例) 10:00〜19:00\n　　10時から19時\n　　10時半から19時半',
        buttonText: '営業時間を入力'
    },
    { key: 'parking', type: 'choice', field: 'parking', text: () => 'お客様用の駐車場はありますか？\n※選択式', options: ['有り', '無し'], buttonText: '有り/無しを入力' },
    { key: 'access_station', type: 'question', field: 'access_station', text: () => '店舗までのアクセス方法を教えてください。\n※もしない場合は「なし」と記入してください\n\nまず、最寄駅から教えてください。', buttonText: '最寄駅を入力' },
    { key: 'access_bus', type: 'question', field: 'access_bus', text: () => '次に、最寄りのバス停を教えてください。', buttonText: '最寄りのバス停を入力' },
    { key: 'category', type: 'choice', field: 'category', text: () => 'お店の業態に一番近いものを選んでください。※選択式', options: ['レストラン', 'カフェ', '焼き肉店', '居酒屋', 'ジビエ料理専門店', 'その他'], buttonText: '業態を入力または選択' },
    { key: 'elevator', type: 'choice', field: 'elevator', text: () => 'アクセシビリティについて教えてください。※選択式\n\nエレベーターはありますか？', options: ['有り', '無し'], buttonText: '有り/無しを入力' },
    { key: 'wheelchair', type: 'choice', field: 'wheelchair', text: () => '車いすでのご利用は可能ですか？', options: ['利用可', '一部利用可（条件付き）', '利用不可'], buttonText: '利用可否を入力' },
    { key: 'stroller', type: 'choice', field: 'stroller', text: () => 'ベビーカーでのご利用は可能ですか？', options: ['利用可', '一部利用可（条件付き）', '利用不可'], buttonText: '利用可否を入力' },
    { key: 'description', type: 'question', field: 'description', text: () => 'あなたの店舗について、簡単に紹介してください。（150文字以内）', buttonText: '紹介文を入力' },
    { key: 'end', type: 'bot', text: () => '入力ありがとうございます！\n下のボタンから登録内容を確認してください。' },
];

const CreateShopChat = () => {
    const router = useRouter();
    const { user, authenticated } = useAuth();

    // ⬇️ これらを追加してね！
    const [suggestedShops, setSuggestedShops] = useState([]);
    const [showSuggestModal, setShowSuggestModal] = useState(false);

    const searchExistingShop = async (keyword) => {
        console.log(`「${keyword}」で検索スタートするよ！`);
        try {
            const res = await fetch(`/api/item/search?q=${encodeURIComponent(keyword)}`);
            if (res.ok) {
                const data = await res.json();
                console.log("検索結果が返ってきたよ！", data);
                if (data.results && data.results.length > 0) {
                    setSuggestedShops(data.results);
                    setShowSuggestModal(true); // 候補があったらモーダル表示！
                }
            } else {
                console.log("お店は見つからなかったみたい💦");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 候補が選ばれた時に自動入力する処理だよ！
    const handleSelectSuggest = (shop) => {
        const nextData = { ...formData, title: shop.title };

        // 住所や他の情報を取り出してformDataにセットしていくよ
        if (shop.price) {
            const parts = shop.price.split(' ');
            if (parts.length >= 4) {
                nextData.postal = parts[0];
                nextData.prefecture = parts[1];
                nextData.city = parts[2];
                nextData.street = parts.slice(3).join(' ');
            } else {
                nextData.street = shop.price;
            }
        }
        if (shop.manager) {
            const mParts = shop.manager.split(' ');
            nextData.managerLast = mParts[0] || '';
            nextData.managerFirst = mParts[1] || '';
        }
        if (shop.managerKana) {
            const mParts = shop.managerKana.split(' ');
            nextData.managerLastKana = mParts[0] || '';
            nextData.managerFirstKana = mParts[1] || '';
        }
        if (shop.email) nextData.email = shop.email;
        if (shop.phone) nextData.phone = shop.phone;
        if (shop.category) nextData.category = shop.category;
        if (shop.intro) nextData.description = shop.intro;
        // （必要に応じて営業時間や設備なども復元してね！）

        setFormData(nextData);
        setShowSuggestModal(false);
        setSuggestedShops([]);

        // チャットにメッセージを出して、最後のステップに飛ばすよ
        setMessages(prev => [...prev, { type: 'bot', text: '店舗情報を自動入力しました！内容を確認してね✨' }]);
        const endIndex = SCENARIO.findIndex(s => s.key === 'end');
        setStepIndex(endIndex);
    };

    const [formData, setFormData] = useState({
        title: "", managerLast: "", managerFirst: "", managerLastKana: "", managerFirstKana: "",
        contact_check: "", email: "", phone: "",
        postal: "", prefecture: "", city: "", street: "",
        timeStartHour: "", timeStartMin: "", timeEndHour: "", timeEndMin: "",
        parking: "", access_station: "", access_bus: "",
        category: "", elevator: "", wheelchair: "", stroller: "", description: "",
    });

    const [messages, setMessages] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [isBotTyping, setIsBotTyping] = useState(false);

    // AI関連のState
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResults, setAiResults] = useState(null);

    const chatEndRef = useRef(null);
    const minSwipeDistance = 50;
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const initMsg = { ...SCENARIO[0], text: SCENARIO[0].text(formData) };
        setMessages([initMsg]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isBotTyping, activeTab]);

    useEffect(() => {
        if (stepIndex < 2) {
            const timer = setTimeout(() => proceedToNextStep(), 1000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepIndex]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentScenario = SCENARIO[stepIndex];
            if (currentScenario && checkIsFilled(currentScenario, formData)) {
                proceedToNextStep(formData);
            }
        }, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, stepIndex]);

    const checkIsFilled = (scenario, data) => {
        if (!scenario.field) return false;

        if (scenario.field === 'manager_kanji') return !!(data.managerLast && data.managerFirst);
        if (scenario.field === 'manager_kana') return !!(data.managerLastKana && data.managerFirstKana);
        if (scenario.field === 'postal') return !!data.postal;
        if (scenario.field === 'street') return !!data.street;
        if (scenario.field === 'time') return !!(data.timeStartHour && data.timeEndHour);
        if (scenario.field === 'contact_check') return !!(data.email || data.phone);

        return !!data[scenario.field];
    };

    const getUserTextFromScenario = (scenario, data) => {
        if (scenario.field === 'manager_kanji') return `${data.managerLast} ${data.managerFirst}`.trim();
        if (scenario.field === 'manager_kana') return `${data.managerLastKana} ${data.managerFirstKana}`.trim();
        if (scenario.field === 'postal') return data.postal;
        if (scenario.field === 'street') return data.street;
        if (scenario.field === 'time') return `${data.timeStartHour}:${data.timeStartMin}〜${data.timeEndHour}:${data.timeEndMin}`;
        if (scenario.field === 'contact_check') return data.email || data.phone ? "お問い合わせ先を入力する" : "スキップする";
        return data[scenario.field] || "入力完了";
    };

    const proceedToNextStep = (latestFormData = formData) => {
        const nextIndex = stepIndex + 1;
        if (nextIndex >= SCENARIO.length) return;
        findNextValidScenario(nextIndex, latestFormData);
    };

    const findNextValidScenario = (startIndex, latestFormData) => {
        let index = startIndex;
        const newMessagesToAdd = [];

        while (index < SCENARIO.length) {
            const s = SCENARIO[index];
            const isSkippedByLogic = s.skipCondition && s.skipCondition(latestFormData);
            const isAlreadyFilled = checkIsFilled(s, latestFormData);

            if (isSkippedByLogic) {
                index++;
                continue;
            }

            if (isAlreadyFilled) {
                let userText = getUserTextFromScenario(s, latestFormData);
                newMessagesToAdd.push({ type: 'user', text: userText, key: `user_ans_${s.key}` });
                index++;
                continue;
            }

            break;
        }

        if (index >= SCENARIO.length) {
            const endIndex = SCENARIO.findIndex(s => s.key === 'end');
            if (endIndex !== -1 && index > endIndex) index = endIndex;
        }

        if (index !== stepIndex || newMessagesToAdd.length > 0) {
            setStepIndex(index);
            setIsBotTyping(true);

            setTimeout(() => {
                setMessages(prev => {
                    let updatedMessages = [...prev];

                    newMessagesToAdd.forEach(userMsg => {
                        const last = updatedMessages[updatedMessages.length - 1];
                        if (!(last && last.type === 'user' && last.text === userMsg.text)) {
                            updatedMessages.push(userMsg);
                        }
                    });

                    const nextScenario = SCENARIO[index];
                    if (nextScenario) {
                        const msgText = typeof nextScenario.text === 'function' ? nextScenario.text(latestFormData) : nextScenario.text;
                        const newBotMsg = { ...nextScenario, text: msgText };
                        if (!updatedMessages.some(msg => msg.key === newBotMsg.key)) {
                            updatedMessages.push(newBotMsg);
                        }
                    }
                    return updatedMessages;
                });
                setIsBotTyping(false);
            }, 600);
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        submitValue(inputText);
    };

    const handleOptionSelect = (value) => {
        submitValue(value);
    };

    const fetchAddress = async (zipcode) => {
        try {
            const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                return { prefecture: data.results[0].address1, city: data.results[0].address2 + data.results[0].address3 };
            }
            return null;
        } catch { return null; }
    };

    const submitValue = async (value) => {
        setMessages(prev => [...prev, { type: 'user', text: value }]);
        setInputText("");
        setIsBotTyping(true);

        const currentScenario = SCENARIO[stepIndex];
        let nextData = { ...formData };

        if (currentScenario && currentScenario.field) {
            if (currentScenario.field === 'manager_kanji') {
                const parts = value.replace(/　/g, ' ').trim().split(/\s+/);
                nextData.managerLast = parts[0] || value;
                nextData.managerFirst = parts[1] || "";
            } else if (currentScenario.field === 'manager_kana') {
                const parts = value.replace(/　/g, ' ').trim().split(/\s+/);
                nextData.managerLastKana = parts[0] || value;
                nextData.managerFirstKana = parts[1] || "";
            } else if (currentScenario.field === 'postal') {
                nextData.postal = value;
                const address = await fetchAddress(value);
                if (address) {
                    nextData.prefecture = address.prefecture;
                    nextData.city = address.city;
                }
            } else if (currentScenario.field === 'time') {
                let timeStr = value.replace(/半/g, "30");
                const match = timeStr.match(/(\d{1,2})[:時]?(\d{1,2})?.*?(?:〜|~|-|から).*?(\d{1,2})[:時]?(\d{1,2})?/);
                if (match) {
                    nextData.timeStartHour = match[1];
                    nextData.timeStartMin = match[2] || "00";
                    nextData.timeEndHour = match[3];
                    nextData.timeEndMin = match[4] || "00";
                }
            } else {
                nextData[currentScenario.field] = value;
                // 🌟店舗名(title)が入力されたら検索をかける！🌟
                if (currentScenario.field === 'title') {
                    searchExistingShop(value);
                }
            }
            setFormData(nextData);
        }

        setIsBotTyping(false);
        setTimeout(() => proceedToNextStep(nextData), 500);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        const nextData = { ...formData, [name]: value };
        setFormData(nextData);

        if (e.target.type === 'radio' || e.target.tagName === 'SELECT') {
            const currentScenario = SCENARIO[stepIndex];
            if (currentScenario && checkIsFilled(currentScenario, nextData)) {
                setTimeout(() => proceedToNextStep(nextData), 300);
            }
        }
    };

    const handleFormBlur = (e) => {
        // 🌟フォーム側でもタイトル入力後に検索をかけるよ🌟
        const { name, value } = e.target;
        if (name === 'title' && value) {
            searchExistingShop(value);
        }
        const currentScenario = SCENARIO[stepIndex];
        if (currentScenario && checkIsFilled(currentScenario, formData)) {
            proceedToNextStep(formData);
        }
    };

    const handleAddressSearch = async (e) => {
        e.preventDefault();
        if (!formData.postal) return;
        const address = await fetchAddress(formData.postal);
        if (address) {
            setFormData(prev => ({ ...prev, prefecture: address.prefecture, city: address.city }));
        } else {
            alert("住所が見つかりませんでした");
        }
    };

    // ★修正ポイント: URLを確実な相対パス(/api/enhance-shop)に変更！
    const handleAiSuggest = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setAiResults(null);
        try {
            const dataToSubmit = new FormData();
            dataToSubmit.append("description", formData.description || `店舗名: ${formData.title}, 業態: ${formData.category} の紹介文を書いてください。`);

            // 環境変数の未定義エラーを防ぐため相対パスに固定
            const res = await fetch(`/api/enhance-shop`, {
                method: "POST",
                body: dataToSubmit
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("API Error:", errText);
                alert("AIの提案に失敗しました。");
                setIsGenerating(false);
                return;
            }

            const json = await res.json();

            if (json.descs) {
                setAiResults(json.descs);
                setMessages(prev => [...prev, { type: 'bot', text: 'AIが紹介文を提案しました！右側のフォームを確認してください✨' }]);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            } else {
                const suggestedText = json.desc || json.text;
                if (suggestedText) {
                    setAiResults({ normal: suggestedText, casual: suggestedText, luxury: suggestedText });
                }
            }
        } catch (err) {
            console.error(err);
            alert("通信エラーが発生しました。");
        }
        setIsGenerating(false);
    };

    const handleSelectAiSuggestion = (text) => {
        setFormData(prev => ({ ...prev, description: text }));
        // チャット側にも「AIの提案を採用した」と流す
        setMessages(prev => [...prev, { type: 'user', text: "AIの提案を採用しました" }]);
        handleFormBlur();
    };

    // ★修正ポイント: URLを確実な相対パス(/api/item/create)に変更！
    const handleSubmit = async () => {
        if (!confirm("入力内容で登録しますか？")) return;
        try {
            const combinedAddress = `${formData.postal} ${formData.prefecture} ${formData.city} ${formData.street}`;
            const combinedManager = `${formData.managerLast} ${formData.managerFirst}`;
            const body = {
                title: formData.title,
                price: combinedAddress,
                image: "https://dummyimage.com/600x400/000/fff",
                description: JSON.stringify({
                    manager: combinedManager,
                    managerKana: `${formData.managerLastKana} ${formData.managerFirstKana}`,
                    email: formData.email,
                    phone: formData.phone,
                    time: `${formData.timeStartHour}:${formData.timeStartMin} 〜 ${formData.timeEndHour}:${formData.timeEndMin}`,
                    parking: formData.parking,
                    access: { station: formData.access_station, bus: formData.access_bus },
                    category: formData.category,
                    accessibility: {
                        elevator: formData.elevator,
                        wheelchair: formData.wheelchair,
                        stroller: formData.stroller
                    },
                    intro: formData.description
                }, null, 2),
                email: user?.email
            };

            const res = await fetch(`/api/item/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify(body)
            });
            if (res.ok) { alert("登録完了！"); router.push("/"); }
            else { alert("登録失敗"); }
        } catch { alert("通信エラー"); }
    };

    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) setActiveTab(1);
        if (distance < -minSwipeDistance) setActiveTab(0);
    };

    const currentScenario = SCENARIO[stepIndex];
    const isEnd = currentScenario?.key === 'end';
    const isChoice = currentScenario?.type === 'choice';
    const placeholderText = currentScenario?.buttonText || "入力してください";

    if (!authenticated) return <div style={{ padding: 20 }}>ログインしてください</div>;

    return (
        <div className={styles.container} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

            {/* --- 左：チャット --- */}
            <div className={`${styles.chatSection} ${activeTab !== 0 ? styles.hiddenOnMobile : ''}`}>
                <div className={styles.chatBackground}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`${styles.messageRow} ${msg.type === 'user' ? styles.userRow : styles.botRow}`}>
                            {msg.type !== 'user' && <div className={styles.avatar}></div>}
                            <div className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i} style={{ margin: 0, minHeight: line === '' ? '1em' : 'auto' }}>{line}</p>
                                ))}
                                {msg.type === 'choice' && msg.options && (
                                    <div className={styles.choiceGroup}>
                                        {msg.options.map((opt, i) => (
                                            <button key={i} className={styles.choiceButton} onClick={() => { if (index === messages.length - 1) handleOptionSelect(opt); }} disabled={index !== messages.length - 1}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isBotTyping && (
                        <div className={`${styles.messageRow} ${styles.botRow}`}>
                            <div className={styles.avatar}></div>
                            <div className={`${styles.bubble} ${styles.botBubble}`}>...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {!isEnd && !isChoice && (
                    <div className={styles.inputArea}>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.chatInput}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={placeholderText}
                                onKeyDown={(e) => {
                                    if (e.nativeEvent.isComposing) return;
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                }}
                            />
                            <button className={styles.sendButton} onClick={handleSend} disabled={!inputText}>➤</button>
                        </div>
                    </div>
                )}
                {isEnd && (
                    <div className={styles.inputArea}>
                        <button className={styles.submitButton} onClick={() => setActiveTab(1)}>内容を確認して登録へ</button>
                    </div>
                )}
            </div>

            {/* --- 右：フォーム --- */}
            <div className={`${styles.formSection} ${activeTab !== 1 ? styles.hiddenOnMobile : ''}`}>
                <div className={styles.formHeader}>店舗情報の入力</div>
                <div className={styles.formContent}>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>店舗名<span className={styles.tagRequired}>必須</span></label>
                        <input name="title" className={styles.input} value={formData.title} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="お店の名前を入力してください" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>管理者名<span className={styles.tagRequired}>必須</span></label>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <span className={styles.subLabel}>姓</span>
                                <input name="managerLast" className={styles.input} value={formData.managerLast} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="山田" />
                            </div>
                            <div className={styles.col}>
                                <span className={styles.subLabel}>名</span>
                                <input name="managerFirst" className={styles.input} value={formData.managerFirst} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="太郎" />
                            </div>
                        </div>
                        <div className={styles.row} style={{ marginTop: '10px' }}>
                            <div className={styles.col}>
                                <span className={styles.subLabel}>セイ</span>
                                <input name="managerLastKana" className={styles.input} value={formData.managerLastKana} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="ヤマダ" />
                            </div>
                            <div className={styles.col}>
                                <span className={styles.subLabel}>メイ</span>
                                <input name="managerFirstKana" className={styles.input} value={formData.managerFirstKana} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="タロウ" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>お問い合わせ先<span className={styles.tagOptional}>任意</span></label>
                        <span className={styles.subLabel}>メールアドレス</span>
                        <input name="email" className={styles.input} value={formData.email} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="example@gmail.com" />
                        <span className={styles.subLabel} style={{ marginTop: '10px' }}>電話番号（ハイフンなし）</span>
                        <input name="phone" className={styles.input} value={formData.phone} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="09012345678" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>住所<span className={styles.tagRequired}>必須</span></label>
                        <span className={styles.subLabel}>郵便番号（ハイフンなし）</span>
                        <div className={styles.postalRow}>
                            <input name="postal" className={`${styles.input} ${styles.inputPostal}`} value={formData.postal} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="1234567" />
                            <button className={styles.addressBtn} onClick={handleAddressSearch}>住所検索</button>
                        </div>

                        <span className={styles.subLabel} style={{ marginTop: '10px' }}>都道府県</span>
                        <input name="prefecture" className={styles.input} style={{ width: '150px' }} value={formData.prefecture} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="北海道" />

                        <span className={styles.subLabel} style={{ marginTop: '10px' }}>市区町村</span>
                        <input name="city" className={styles.input} value={formData.city} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="○○市○○区○○町" />

                        <span className={styles.subLabel} style={{ marginTop: '10px' }}>番地・建物名・部屋番号</span>
                        <input name="street" className={styles.input} value={formData.street} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="1-2-1 パークハイツ 101号室" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>営業時間 <span style={{ fontSize: '10px', color: 'red', fontWeight: 'normal', marginLeft: '5px' }}>※上下にスクロールしてください</span></label>
                        <div className={styles.timeRow}>
                            <input name="timeStartHour" className={styles.inputTime} value={formData.timeStartHour} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="00" /> ：
                            <input name="timeStartMin" className={styles.inputTime} value={formData.timeStartMin} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="00" /> ～
                            <input name="timeEndHour" className={styles.inputTime} value={formData.timeEndHour} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="00" /> ：
                            <input name="timeEndMin" className={styles.inputTime} value={formData.timeEndMin} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="00" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>駐車場の有無</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="parking" value="有り" checked={formData.parking === '有り'} onChange={handleFormChange} /> 有り
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="parking" value="無し" checked={formData.parking === '無し'} onChange={handleFormChange} /> 無し
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>アクセス方法</label>
                        <span className={styles.subLabel}>最寄り駅</span>
                        <input name="access_station" className={styles.input} value={formData.access_station} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="○○駅" />
                        <span className={styles.subLabel} style={{ marginTop: '10px' }}>最寄りバス停</span>
                        <input name="access_bus" className={styles.input} value={formData.access_bus} onChange={handleFormChange} onBlur={handleFormBlur} placeholder="○○町1丁目バス停" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>業態</label>
                        <select name="category" className={styles.select} value={formData.category} onChange={handleFormChange} onBlur={handleFormBlur}>
                            <option value="">- 選択してください -</option>
                            <option value="レストラン">レストラン</option>
                            <option value="カフェ">カフェ</option>
                            <option value="焼き肉店">焼き肉店</option>
                            <option value="居酒屋">居酒屋</option>
                            <option value="ジビエ料理専門店">ジビエ料理専門店</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>アクセシビリティ（設備情報）</label>
                        <div style={{ marginTop: '20px' }}>
                            <span className={styles.subLabel}>車いす対応</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['利用可', '一部利用可（条件付き）', '利用不可'].map(opt => (
                                    <label key={opt} className={styles.radioLabel}>
                                        <input type="radio" name="wheelchair" value={opt} checked={formData.wheelchair === opt} onChange={handleFormChange} /> {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <span className={styles.subLabel}>ベビーカー</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['利用可', '一部利用可（条件付き）', '利用不可'].map(opt => (
                                    <label key={opt} className={styles.radioLabel}>
                                        <input type="radio" name="stroller" value={opt} checked={formData.stroller === opt} onChange={handleFormChange} /> {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- あなたのお店を紹介してください！エリア --- */}
                    <div className={styles.formGroup}>
                        <div className={styles.introSectionWrapper}>

                            {/* 左側：入力とボタン */}
                            <div className={styles.introLeft}>
                                <label className={styles.label}>あなたのお店を紹介してください！</label>

                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    onBlur={handleFormBlur}
                                    placeholder="例）私の店舗は地元のエゾシカ肉を使ったジビエ料理を提供しており..."
                                />
                                <div className={styles.footerRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span className={styles.errorText}>※150文字以内</span>
                                    <span className={styles.charCount}>現在 {formData.description.length} 文字</span>
                                </div>

                                {/* AI提案ボタン (点線枠デザイン) */}
                                <button
                                    className={styles.aiButton}
                                    onClick={handleAiSuggest}
                                    disabled={isGenerating || !formData.title}
                                >
                                    {isGenerating ? '✨ AIが考え中...' : '✨ AIに紹介文を提案してもらう ✨'}
                                </button>
                            </div>

                            {/* 右側：AI提案結果エリア (緑枠デザイン) */}
                            {aiResults && (
                                <div className={styles.introRight}>
                                    <div className={styles.suggestionMainTitle}>AIからの提案候補</div>

                                    <div className={styles.aiSuggestionBox}>
                                        <div className={styles.suggestionDesc}>
                                            AIが改善や追加のアイデアを提案し<br />
                                            文章を選択すると選択したものが反映されます
                                        </div>

                                        <div className={styles.suggestionItem} onClick={() => handleSelectAiSuggestion(aiResults.normal)}>
                                            <strong>① 文章の添削</strong>
                                            {aiResults.normal || "..."}
                                        </div>

                                        <hr className={styles.suggestionDivider} />

                                        <div className={styles.suggestionItem} onClick={() => handleSelectAiSuggestion(aiResults.casual)}>
                                            <strong>② 文章の添削（親しみやすさ重視）</strong>
                                            {aiResults.casual || "..."}
                                        </div>

                                        <hr className={styles.suggestionDivider} />

                                        <div className={styles.suggestionItem} onClick={() => handleSelectAiSuggestion(aiResults.luxury)}>
                                            <strong>③ 文章の添削（店舗の雰囲気に寄せた形）</strong>
                                            {aiResults.luxury || "..."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ---------------------------------------------- */}

                    <button className={styles.submitButton} onClick={handleSubmit}>
                        登録内容を確定させる
                    </button>
                    <button className={styles.saveButton} onClick={() => router.push('/')}>
                        下書きを一時保存してホーム画面へ戻る
                    </button>
                </div>
            </div>

            <div className={styles.mobileNavContainer}>
                <div className={styles.navigationBar}>
                    {activeTab === 0 ? (
                        <>
                            <button className={styles.navButtonRed} onClick={() => router.push('/')}>中断する</button>
                            <button className={styles.navButtonWhite} onClick={() => setActiveTab(1)}>フォーム入力へ <span className={styles.arrowIcon}>＞</span></button>
                        </>
                    ) : (
                        <>
                            <button className={styles.navButtonWhite} onClick={() => setActiveTab(0)}><span className={styles.arrowIcon}>＜</span> 対話入力へ</button>
                            <button className={styles.navButtonRed} onClick={() => router.push('/')}>中断する</button>
                        </>
                    )}
                </div>
            </div>
            {/* 🌟ここから「もしかして？」のモーダル🌟 */}
            {showSuggestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>もしかして、こちらのお店ですか？👀</h3>
                        <p className={styles.modalDesc}>
                            すでに登録されている店舗が見つかりました！<br />
                            選択すると情報が自動で入力されるよ✨
                        </p>
                        <div className={styles.suggestList}>
                            {suggestedShops.map((shop, i) => (
                                <div key={i} className={styles.suggestItem} onClick={() => handleSelectSuggest(shop)}>
                                    <h4>{shop.title}</h4>
                                    <p>{shop.price}</p>
                                </div>
                            ))}
                        </div>
                        <button className={styles.closeButton} onClick={() => setShowSuggestModal(false)}>
                            違うので新しく登録する
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateShopChat;