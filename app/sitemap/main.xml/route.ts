import { NextResponse } from 'next/server';
import db from '@/lib/keywords/db';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export async function GET() {
    try {
        const result = db.prepare('SELECT COUNT(*) as count FROM keywords').get() as { count: number };
        const total = result.count;
        const limit = 10000;
        const numberOfSitemaps = Math.ceil(total / limit);
        const baseUrl = 'https://pornse.org';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Always add at least sitemap 0
        const count = numberOfSitemaps === 0 ? 1 : numberOfSitemaps;

        for (let id = 0; id < count; id++) {
            xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap/${id}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
        }

        xml += `
</sitemapindex>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (error) {
        console.error('Error serving sitemap index:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
