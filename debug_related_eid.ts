import { fetchHtml } from './lib/scraper';
import * as cheerio from 'cheerio';

async function run() {
    // EID from debug_eid_test.ts: otdddavbd5b
    const url = `https://www.xvideos.com/video.otdddavbd5b/a`;
    console.log(`Fetching detail: ${url}`);

    const html = await fetchHtml(url);
    if (!html) {
        console.log("Failed to fetch detail.");
        return;
    }

    const extractString = (str: string, start: string, end: string): string | null => {
        const parts = str.split(start);
        if (parts.length < 2) return null;
        return parts[1].split(end)[0];
    };

    // Check related
    const relatedRaw = extractString(html, 'var video_related=', ';window.wpn_categories');
    if (relatedRaw) {
        try {
            const parsed = JSON.parse(relatedRaw);
            console.log(`Found ${parsed.length} related videos.`);
            console.log("First related item keys:", Object.keys(parsed[0]));
            if (parsed.length > 0) {
                console.log("Sample ID (id):", parsed[0].id);
                console.log("Sample EID (eid):", parsed[0].eid);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    } else {
        console.log("No related data found.");
    }
}

run();
