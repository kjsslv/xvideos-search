import { NextResponse } from 'next/server';
import db from '@/lib/keywords/db';
import { slugifySearchQuery } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        // id will be "0.xml", "1.xml" etc.
        const idString = params.id.replace('.xml', '');
        const id = parseInt(idString, 10);

        if (isNaN(id)) {
            return new NextResponse('Invalid sitemap ID', { status: 400 });
        }

        const limit = 10000;
        const start = id * limit;
        const baseUrl = 'https://pornse.org';

        let keywords: { text: string }[] = [];
        try {
            keywords = db.prepare('SELECT text FROM keywords LIMIT ? OFFSET ?').all(limit, start) as { text: string }[];
        } catch (error) {
            console.error(`Error fetching keywords for sitemap ${id}:`, error);
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static routes to sitemap 0
        if (id === 0) {
            xml += `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
        }

        for (const keyword of keywords) {
            const slug = slugifySearchQuery(keyword.text);
            xml += `
  <url>
    <loc>${baseUrl}/s/${slug}.html</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }

        xml += `
</urlset>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
