import { fetchHtml } from './lib/scraper';
import * as cheerio from 'cheerio';

async function run() {
    const id = '34330977'; // Known valid ID
    const url = `https://www.xvideos.com/video${id}/a`;
    console.log(`Fetching: ${url}`);

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    console.log("--- Analyzing Metadata ---");

    // Tags
    const tags: string[] = [];
    $('.video-tags-list li a').each((_, el) => {
        const tag = $(el).text();
        if (tag) tags.push(tag);
    });
    console.log("Tags:", tags);

    // Views
    let views = $('#nb-views').text().trim();
    if (!views) {
        views = $('.mobile-hide #nb-views').text().trim();
    }
    if (!views) {
        views = $('strong.nb-views').text().trim() || $('.nb-views').text().trim();
    }

    if (!views) {
        const viewIdx = html.indexOf("Views");
        if (viewIdx !== -1) {
            console.log("Context around 'Views':");
            console.log(html.substring(viewIdx - 100, viewIdx + 50));
        } else {
            console.log("'Views' string not found in HTML.");
        }
    }

    console.log("Views found:", views);

    // Duration
    const duration = $('.duration').first().text().trim();
    console.log("Duration (.duration):", duration);
    const durationMeta = $('meta[property="og:duration"]').attr('content');
    console.log("Duration (Meta):", durationMeta);
}

run();
