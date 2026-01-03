import Link from 'next/link';
import FooterKeywords from './FooterKeywords';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-zinc-950 py-10 mt-10">
            <div className="mx-auto max-w-screen-xl px-4">

                {/* Keywords Section - Random from SQLite */}
                <FooterKeywords />

                {/* Copyright Section */}
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} <span className="font-bold text-white">PhimSex.NET</span>. All rights reserved.
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/" className="text-sm text-gray-500 hover:text-white">Trang chủ</Link>
                        <Link href="#" className="text-sm text-gray-500 hover:text-white">Điều khoản</Link>
                        <Link href="#" className="text-sm text-gray-500 hover:text-white">Liên hệ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
