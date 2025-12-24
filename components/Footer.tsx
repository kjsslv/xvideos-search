import Link from 'next/link';
import { slugify } from '@/lib/utils';

async function getKeywords() {
    try {
        const randomNum = Math.floor(Math.random() * 47) + 1;
        const res = await fetch(`https://xxxporns.org/kw/vn/${randomNum}.txt`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const text = await res.text();
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        // Shuffle and pick 30
        const shuffled = lines.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 30);
    } catch (error) {
        return [];
    }
}

export default async function Footer() {
    const keywords = await getKeywords();

    return (
        <footer className="border-t border-white/10 bg-zinc-950 py-10 mt-10">
            <div className="mx-auto max-w-screen-xl px-4">

                {/* Keywords Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Từ Khóa Phổ Biến</h3>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((kw, idx) => {
                            const cleanKw = kw.trim();
                            const slug = slugify(cleanKw);

                            return (
                                <Link
                                    key={idx}
                                    href={`/s/${slug}.html`}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors bg-zinc-900 px-2 py-1 rounded border border-white/5"
                                >
                                    {cleanKw}
                                </Link>
                            )
                        })}
                    </div>
                </div>

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
