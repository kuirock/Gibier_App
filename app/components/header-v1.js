import Image from "next/image"
import Link from "next/link"

const Header = () => {
    return (
        <header>
            <div>
                <Link href="/">
                    <div className="logo">hokkaido-gibier</div>
                </Link>
            </div>
            <nav>
                <ul>
                    <li><Link href="/user/register">登録</Link></li>
                    <li><Link href="/user/login">ログイン</Link></li>
                    <li><Link href="/shop/create/">店舗登録</Link></li>
                    <li><Link href="/item/create">メニュー登録</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
