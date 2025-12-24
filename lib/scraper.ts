import * as cheerio from 'cheerio';
import { slugify } from './utils';
// getString import removed as it is not exported from utils

// Wait, I didn't export getString from utils, I'll add it there or just inline it since it's specific.
// Let's rely on standard parsing where possible, but use the "substring" method for JS vars.

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
};

const extractString = (str: string, start: string, end: string): string | null => {
    const parts = str.split(start);
    if (parts.length < 2) return null;
    return parts[1].split(end)[0];
};

export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    duration?: string;
    url: string; // The relative URL or ID to use
    rating?: string; // string "100%", "95%", etc, or extracted raw "r"
}

export interface VideoDetail {
    id: string;
    title: string;
    thumbnail: string;
    mp4: string;
    related: Video[];
    duration?: string;
    views?: string;
    tags: string[];
}

export const fetchHtml = async (url: string) => {
    try {
        console.log(`[Scraper] Fetching: ${url}`);
        const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!res.ok) {
            console.error(`[Scraper] Fetch failed: ${res.status} ${res.statusText}`);
            throw new Error("Failed to fetch");
        }
        const text = await res.text();
        console.log(`[Scraper] Fetched ${text.length} bytes`);
        return text;
    } catch (e) {
        console.error("Fetch Error:", e);
        return "";
    }
}

export const searchVideos = async (query: string, page = 0): Promise<Video[]> => {
    // Xvideos: https://www.xvideos.com/?k=QUERY&p=PAGE
    const searchQuery = query || 'Jav HD';
    const url = `https://www.xvideos.com/?k=${encodeURIComponent(searchQuery)}&quality=hd&p=${page}`;

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const videos: Video[] = [];

    $('div.thumb-block').each((_, element) => {
        const el = $(element);
        const dataId = el.attr('data-eid');

        // Title parsing
        let title = el.find('p.title a').attr('title');
        if (!title) title = el.find('p.title a').text();

        // Thumb parsing
        let thumb = el.find('.thumb img').attr('data-src') || el.find('.thumb img').attr('src') || "";

        if (thumb.includes('THUMBNUM')) {
            const randomNum = Math.floor(Math.random() * 30) + 1;
            thumb = thumb.replace('THUMBNUM', randomNum.toString());
        }

        // Duration
        const duration = el.find('.duration').first().text().trim() || "";

        if (dataId) {
            const cleanTitle = (title || "").trim();
            // Slice to 30 chars for video slugs to keep URLs short, similar to original logic
            const slug = slugify(cleanTitle).slice(0, 30).replace(/-+$/, '');
            videos.push({
                id: dataId,
                title: cleanTitle,
                thumbnail: thumb.replace('/thumbs169/', '/thumbs169lll/'),
                duration,
                url: `/video/${dataId}/${slug}`
            });
        }
    });

    return videos;
};

import { cache } from 'react';

export const getVideoDetail = cache(async (id: string): Promise<VideoDetail | null> => {
    // PHP: https://www.xvideos.com/video.EID/a
    // ID passed here is expected to be the EID (alphanumeric)
    const url = `https://www.xvideos.com/video.${id}/a`;
    const html = await fetchHtml(url);
    if (!html) return null;

    // Direct string extraction for JS variables (Cheerio is bad at scripting parts)
    const mp4Hls = extractString(html, "html5player.setVideoHLS('", "');")?.replace(/[\n\r\s]/g, '');
    const mp4High = extractString(html, "html5player.setVideoUrlHigh('", "');")?.replace(/[\n\r\s]/g, '');
    const mp4Low = extractString(html, "html5player.setVideoUrlLow('", "');")?.replace(/[\n\r\s]/g, '');

    const mp4 = mp4Hls || mp4High || mp4Low || "";

    // Title
    const title = decodeURIComponent(extractString(html, "html5player.setVideoTitle('", "');") || "");
    const thumb = extractString(html, "html5player.setThumbSlide('", "');") || "";

    const $ = cheerio.load(html);

    // Tags
    const tags: string[] = [];
    $('.video-tags-list li a').each((_, el) => {
        const $el = $(el);
        $el.find('.count').remove();
        const tag = $el.text().trim();
        if (tag && tag !== '+' && !tag.includes('Edit tags')) {
            tags.push(tag);
        }
    });

    // Duration
    const duration = $('.duration').first().text().trim();

    // Views
    // Try multiple selectors
    let views = $('#nb-views').text().trim();
    if (!views) views = $('.mobile-hide #nb-views').text().trim();
    if (!views) views = $('.nb-views').text().trim();

    // Related
    const relatedRaw = extractString(html, 'var video_related=', ';window.wpn_categories');
    let related: Video[] = [];
    if (relatedRaw) {
        try {
            const parsed = JSON.parse(relatedRaw);
            // Expected format from XVideos related JSON
            // [{id, u, i, tf, ...}]
            // u = url, i = image, tf = title, d = duration?, r = rating (e.g. "100%")
            related = parsed.map((item: any) => {
                const itemTitle = item.tf?.toString() || "";
                const itemSlug = slugify(itemTitle).slice(0, 30).replace(/-+$/, '');
                return {
                    id: item.eid?.toString(),
                    title: itemTitle,
                    thumbnail: item.i.replace('/thumbs169/', '/thumbs169lll/'),
                    duration: item.d,
                    rating: item.r, // Extract rating "r"
                    url: `/video/${item.eid}/${itemSlug}`
                };
            });

            // Sort by rating desc
            // Rating "r" is usually like "95%" or "100%". We need to parse int
            related.sort((a, b) => {
                const rA = parseInt(a.rating?.replace('%', '') || "0");
                const rB = parseInt(b.rating?.replace('%', '') || "0");
                return rB - rA;
            });

            // Limit to 40 items (restoring full list) but keep payload minimal
            // Remove 'rating' as it is not used in UI
            related = related.slice(0, 40).map(v => {
                const { rating, ...rest } = v;
                return rest as Video;
            });

        } catch (e) { }
    }

    return {
        id,
        title,
        thumbnail: thumb,
        mp4,
        related,
        duration,
        views,
        tags
    };
});
