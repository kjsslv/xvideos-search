import { fetchHtml } from './lib/scraper';
import * as cheerio from 'cheerio';

async function run() {
    const url = `https://www.xvideos.com/?k=Jav+HD&quality=hd`;
    console.log(`Fetching search: ${url}`);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    console.log("Inspecting first 3 videos:");
    $('div.thumb-block').slice(0, 3).each((i, element) => {
        const el = $(element);
        const dataId = el.attr('data-id');
        const dataEid = el.attr('data-eid');
        console.log(`[${i}] data-id: "${dataId}" | data-eid: "${dataEid}"`);

        if (dataEid) {
            const urlDot = `https://www.xvideos.com/video.${dataEid}/a`;
            console.log(`    Testing Dot URL: ${urlDot}`);
        }
        if (dataId) {
            const urlNoDot = `https://www.xvideos.com/video${dataId}/a`;
            console.log(`    Legacy URL: ${urlNoDot}`);
        }
    });
}

run();
