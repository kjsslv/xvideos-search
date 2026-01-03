import Link from 'next/link';
import { slugifySearchQuery } from '@/lib/utils';
import db from '@/lib/keywords/db';

export default async function FooterKeywords() {
    let keywords: { text: string }[] = [];

    try {
        // Fetch 30 random keywords
        // db.prepare is synchronous but safe in Server Components context usually if read-only
        // Note: better-sqlite3 is synchronous. Next.js App Router usually handles this fine.
        keywords = db.prepare('SELECT text FROM keywords ORDER BY RANDOM() LIMIT 30').all() as { text: string }[];
    } catch (e) {
        console.error("Failed to fetch keywords:", e);
    }

    if (keywords.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Popular Keywords</h3>
            <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => {
                    const cleanKw = kw.text;
                    const slug = slugifySearchQuery(cleanKw);

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
    );
}
