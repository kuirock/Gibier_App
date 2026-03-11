"use client"
import { useState } from "react"
import "./style.css";

const Login = () => {
    const [email, setEmail] = useState("") 
    const [password, setPassword] = useState("")

    const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            const response = await fetch("http://localhost:3000/api/user/login", {
                method: "POST",
                headers: { 
                    "Accept": "application/json", 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            const jsonData = await response.json() 
            localStorage.setItem("token", jsonData.token) 
            alert(jsonData.message) 
        }catch{
            alert("ログイン失敗")
        }
    }
    
    return (
        <div className="screen">

            <div className="p">
                <span className="span">メールアドレス </span>
                <span className="text-wrapper-2">※必須</span>
                <form onSubmit={handleSubmit}>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="メールアドレス" required/><br></br>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="パスワード" required/><br></br>
                    <button>ログイン</button>
                </form>
            </div>

           <div className="flexcontainer">
                <div className="text">
                    <span className="text-wrapper-3"
                        >〇 すべて半角で入力してください</span
                    >
                </div>
                <div className="text">
                    <span className="text-wrapper-3"
                        >〇 8文字以上20文字以内で入力してください</span
                    >
                </div>
                <div className="text">
                    <span className="text-wrapper-3"
                        >〇 全角英字と数字を含めてください</span
                    >
                </div>
                <div className="text">
                    <span className="text-wrapper-3">〇 記号は使用できません</span>
                </div>
            </div>

            <div className="div">
                <span className="span">利用規約 </span>
                <span className="text-wrapper-2">※必須</span>
                <span className="span"
                    >（？）<br /><br />□
                    注意事項・利用規約・プライバシーポリシーに<br />ご同意の上、確認画面へお進みください</span
                >
            </div>

            <div className="rectangle-2"></div>
            <div className="div-3">
                <span className="span">パスワード（確認用）</span>
                <span className="text-wrapper-2">※必須</span>
            </div>
            <div className="group-2">
                <div className="rectangle-4"></div>
                <div className="text-wrapper-4">登録を完了させる</div>
            </div>

            <div className="group-3">
                <div className="group-4">
                    <div className="rectangle-5"></div>
                    <div className="group-5">
                        <div className="text-wrapper-5">新規会員のご登録</div>
                        <div className="web">
                            （Webサイト名）での会員情報（お店、管理者名、<br />住所）の登録
                        </div>
                    </div>
                    <div className="text-wrapper-6">後で編集できます</div>
                </div>
                <div className="group-6">
                    <div className="group-7"></div>
                    <div className="group-8">
                        <div className="text-wrapper-7">1</div>
                        <div className="text-wrapper-8">３</div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Login