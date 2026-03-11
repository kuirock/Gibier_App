"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

// --- 各画面コンポーネント ---

// 0. TOP画面
const TopScreen = ({ setStep, scrollToTop }) => (
    <div className={styles.topScreen}>
        <div className={styles.circleDeco}></div>
        <div className={styles.topContent}>
            <h1 className={styles.topTitle}>
                (Webサイト名)<br />
                飲食店情報登録サイト
            </h1>
            <p className={styles.topDesc}>
                エゾシカ料理を<br />
                提供するお店をもっと多くの人に。<br />
                このサイトは、食べたい人と<br />
                登録したお店をつなげます。
            </p>
            <button
                className={styles.whiteButton}
                onClick={() => { setStep(1); scrollToTop(); }}
            >
                会員登録をする
            </button>
        </div>
    </div>
);

// 1. 基本情報入力
const InputScreen = ({ formData, handleChange, setStep, scrollToTop }) => {
    const [showPassword, setShowPassword] = useState(false);

    // ボタンのスタイル切り替え
    const buttonClass = formData.agree
        ? styles.primaryButton
        : `${styles.primaryButton} ${styles.buttonDisabled}`;

    return (
        <>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => setStep(0)}>←</button>
                会員情報
            </div>
            <div className={styles.content}>
                <div className={styles.stepBox}>
                    <div className={styles.stepCircle}>1/3</div>
                    <div className={styles.stepText}>
                        <h2>新規会員のご登録</h2>
                        <p>全項目入力必須です</p>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>メールアドレス<span className={styles.required}>必須</span></label>
                    <input
                        type="email"
                        name="email"
                        className={styles.input}
                        placeholder="例) example@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>新規パスワード<span className={styles.required}>必須</span></label>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={styles.input}
                        placeholder="パスワードを入力してください"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {/* CSSクラスで制御 */}
                    <div className={styles.passwordToggle}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            /> パスワードを表示する
                        </label>
                    </div>

                    <ul className={styles.note}>
                        <li>すべて半角で入力してください</li>
                        <li>8文字以上20文字以内で入力してください</li>
                        <li>全角英字と数字を含めてください</li>
                        <li>記号は使用できません</li>
                    </ul>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>パスワード（確認用）<span className={styles.required}>必須</span></label>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        className={styles.input}
                        placeholder="確認用パスワードを入力してください"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {/* CSSクラスで制御 */}
                <div className={`${styles.formGroup} ${styles.termsGroup}`}>
                    <p className={styles.termsNote}>
                        利用規約・プライバシーポリシーにご同意の上、<br />確認画面へお進みください
                    </p>

                    <label className={styles.label}>利用規約</label>
                    <div className={styles.termsBox}>
                        【利用規約】<br />
                        この利用規約（以下，「本規約」といいます。）は...
                    </div>

                    <label className={styles.label}>プライバシーポリシー</label>
                    <div className={styles.termsBox}>
                        【プライバシーポリシー】<br />
                        当社は，本ウェブサイト上で提供するサービスにおける...
                    </div>

                    {/* CSSクラスで制御 */}
                    <div className={styles.agreeCheck}>
                        <label>
                            <input
                                type="checkbox"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                            /> 利用規約・プライバシーポリシーに同意する
                        </label>
                    </div>
                </div>

                <button
                    className={buttonClass}
                    onClick={() => {
                        if (!formData.agree) { alert("規約に同意してください"); return; }
                        if (formData.password !== formData.confirmPassword) { alert("パスワードが一致しません"); return; }
                        if (!formData.email || !formData.password) { alert("必須項目を入力してください"); return; }
                        setStep(2);
                        scrollToTop();
                    }}
                >
                    確認画面へ
                </button>
            </div>
        </>
    );
};

// 2. 確認画面
const ConfirmScreen = ({ formData, handleRegister, setStep, scrollToTop }) => {
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => setStep(1)}>←</button>
                確認画面
            </div>
            <div className={styles.content}>
                <div className={styles.stepBox}>
                    <div className={styles.stepCircle}>2/3</div>
                    <div className={styles.stepText}>
                        <h2>登録情報の確認</h2>
                        <p>(Webサイト名)での会員情報を確認</p>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>会員登録</h3>

                    <div className={styles.confirmRow}>
                        <div className={styles.confirmLabel}>メールアドレス</div>
                        <div className={styles.confirmValue}>{formData.email || '未入力'}</div>
                    </div>

                    <div className={styles.confirmRow}>
                        <div className={styles.confirmLabel}>パスワード</div>
                        <div className={styles.confirmValue}>
                            {showConfirmPassword ? formData.password : "●●●●●●●●"}
                        </div>
                        {/* CSSクラスで制御 */}
                        <div className={styles.passwordToggle}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={showConfirmPassword}
                                    onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                                /> パスワードを表示する
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    className={styles.secondaryButton}
                    onClick={() => { setStep(1); scrollToTop(); }}
                    style={{ marginBottom: '16px' }}
                >
                    会員情報を編集する
                </button>

                <button
                    className={styles.primaryButton}
                    onClick={handleRegister}
                >
                    登録を完了させる
                </button>
            </div>
        </>
    );
};

// 3. 完了画面
const CompleteScreen = ({ setStep, scrollToTop, setFormData, router }) => (
    <>
        <div className={styles.header}>
            会員登録
        </div>
        <div className={styles.content}>
            <div className={styles.stepBox}>
                {/* CSSクラスで制御 */}
                <div className={`${styles.stepCircle} ${styles.stepCircleComplete}`}>3/3</div>
                <div className={styles.stepText}>
                    <h2>会員登録完了</h2>
                </div>
            </div>

            <div className={styles.completeMessage}>
                <h2 className={styles.completeTitle}>会員登録完了！</h2>
                <p className={styles.completeMainText}>
                    会員登録が完了しました。<br />
                    ご登録ありがとうございます。<br />
                    確認メールをお送りしましたので、<br />
                    内容をご確認ください。
                </p>
                <p className={styles.completeSubText}>
                    登録情報はあとから編集できます。
                </p>
            </div>

            <button className={styles.primaryButton} onClick={() => router.push('/shop/create/')}>
                店舗登録へ進む
            </button>

            <button
                className={styles.secondaryButton}
                onClick={() => router.push('/')}
            >
                ホーム画面へ戻る
            </button>
        </div>
    </>
);


// --- メインコンポーネント ---
export default function RegisterApp() {
    const [step, setStep] = useState(0);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        agree: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const handleRegister = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/user/register`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "新規ユーザー",
                    email: formData.email,
                    password: formData.password
                })
            });
            const jsonData = await response.json();

            if (response.ok) {
                setStep(3);
                scrollToTop();
            } else {
                alert(jsonData.message || "登録に失敗しました");
            }
        } catch (error) {
            alert("通信エラーが発生しました");
        }
    };

    return (
        <div className={styles.container}>
            {step === 0 && (
                <TopScreen setStep={setStep} scrollToTop={scrollToTop} />
            )}
            {step === 1 && (
                <InputScreen
                    formData={formData}
                    handleChange={handleChange}
                    setStep={setStep}
                    scrollToTop={scrollToTop}
                />
            )}
            {step === 2 && (
                <ConfirmScreen
                    formData={formData}
                    handleRegister={handleRegister}
                    setStep={setStep}
                    scrollToTop={scrollToTop}
                />
            )}
            {step === 3 && (
                <CompleteScreen
                    setStep={setStep}
                    scrollToTop={scrollToTop}
                    setFormData={setFormData}
                    router={router}
                />
            )}
        </div>
    );
}