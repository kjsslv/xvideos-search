import * as cheerio from 'cheerio';
import { decode } from 'html-entities';
import { slugify, base64UrlEncode } from './utils';
import { getOrSet } from './repository';
import { cache } from 'react';

// Headers for scraping
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'Accept-Language': ''
};

const extractString = (str: string, start: string, end: string): string | null => {
    const parts = str.split(start);
    if (parts.length < 2) return null;
    return parts[1].split(end)[0];
};

const safeDecodeURIComponent = (str: string) => {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    duration?: string;
    url: string;
    rating?: string;
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

        const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
        if (!res.ok) {
            console.error(`[Scraper] Fetch failed: ${res.status} ${res.statusText}`);
            throw new Error("Failed to fetch");
        }
        const text = await res.text();

        return text;
    } catch (e) {
        console.error("Fetch Error:", e);
        return "";
    }
}

// Internal function to scrape search results/home
const _scrapeSearchVideos = async (query: string, page = 0): Promise<Video[]> => {
    // Xvideos: https://www.xvideos.com/?k=QUERY&p=PAGE
    // Xvideos: https://www.xvideos.com/?k=QUERY&p=PAGE
    let url = "";

    if (!query || query === 'home') {
        // Homepage: Best video
        url = `https://www.xvideos.com/?k=teen&sort=views&quality=1080P&p=${page}`;
    } else {
        // Search
        const searchQuery = query.trim();
        // Use + for spaces, keep other characters (including non-English) as is
        const formattedQuery = searchQuery.replace(/\s+/g, '+');
        url = `https://www.xvideos.com/?k=${formattedQuery}&quality=hd&p=${page}`;
    }

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const videos: Video[] = [];

    $('div.thumb-block').each((_, element) => {
        const el = $(element);
        const dataId = el.attr('data-eid');

        // Title parsing
        let title = el.find('p.title a').attr('title');
        if (!title) title = el.find('p.title a').text();
        title = decode(title);

        // Thumb parsing
        let thumb = el.find('.thumb img').attr('data-src') || el.find('.thumb img').attr('src') || "";

        if (thumb.includes('THUMBNUM')) {
            const randomNum = Math.floor(Math.random() * 30) + 1;
            thumb = thumb.replace('THUMBNUM', randomNum.toString());
        }

        // Duration
        const duration = decode(el.find('.duration').first().text().trim() || "");

        if (dataId) {
            const cleanTitle = (title || "").trim();
            const slug = slugify(cleanTitle).slice(0, 30).replace(/-+$/, '');
            videos.push({
                id: dataId,
                title: cleanTitle,
                thumbnail: thumb.replace('/thumbs169/', '/thumbs169lll/'),
                duration,
                url: `/video/${base64UrlEncode(dataId)}/${slug}`
            });
        }
    });

    return videos;
};

// Internal function to scrape video details
const _scrapeVideoDetail = async (id: string): Promise<VideoDetail | null> => {
    const url = `https://www.xvideos.com/video.${id}/a`;
    const html = await fetchHtml(url);
    if (!html) return null;

    const mp4Hls = extractString(html, "html5player.setVideoHLS('", "');")?.replace(/[\n\r\s]/g, '');
    const mp4High = extractString(html, "html5player.setVideoUrlHigh('", "');")?.replace(/[\n\r\s]/g, '');
    const mp4Low = extractString(html, "html5player.setVideoUrlLow('", "');")?.replace(/[\n\r\s]/g, '');

    const mp4 = mp4Hls || mp4High || mp4Low || "";

    const title = decode(safeDecodeURIComponent(extractString(html, "html5player.setVideoTitle('", "');") || ""));
    const thumb = extractString(html, "html5player.setThumbSlide('", "');") || "";

    const $ = cheerio.load(html);

    const tags: string[] = [];
    $('.video-tags-list li a').each((_, el) => {
        const $el = $(el);
        $el.find('.count').remove();
        const tag = $el.text().trim();
        if (tag && tag !== '+' && !tag.includes('Edit tags')) {
            tags.push(decode(tag));
        }
    });

    const duration = decode($('.duration').first().text().trim());

    let views = $('#nb-views').text().trim();
    if (!views) views = $('.mobile-hide #nb-views').text().trim();
    if (!views) views = $('.nb-views').text().trim();

    const relatedRaw = extractString(html, 'var video_related=', ';window.wpn_categories');
    let related: Video[] = [];
    if (relatedRaw) {
        try {
            const parsed = JSON.parse(relatedRaw);
            interface RelatedVideoRaw {
                eid?: string | number;
                tf?: string;
                i: string;
                d: string;
                r: string;
            }
            related = parsed.map((item: RelatedVideoRaw) => {
                const itemTitle = decode(item.tf?.toString() || "");
                const itemSlug = slugify(itemTitle).slice(0, 30).replace(/-+$/, '');
                return {
                    id: item.eid?.toString() || "",
                    title: itemTitle,
                    thumbnail: item.i.replace('/thumbs169/', '/thumbs169lll/'),
                    duration: decode(item.d),
                    rating: item.r,
                    url: `/video/${base64UrlEncode(item.eid?.toString() || "")}/${itemSlug}`
                };
            });


            related.sort((a, b) => {
                const rA = parseInt(a.rating?.replace('%', '') || "0");
                const rB = parseInt(b.rating?.replace('%', '') || "0");
                return rB - rA;
            });

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
};

// Exported wrappers with JSON caching
export const searchVideos = cache(async (query: string, page = 0): Promise<Video[]> => {
    const cleanQuery = query || 'home';
    // Create a safe key for the filename using base64 to handle special characters
    const fileKey = base64UrlEncode(cleanQuery);
    const key = `search/${fileKey}-p${page}`;

    return getOrSet(key, () => _scrapeSearchVideos(query, page));
});

export const getVideoDetail = cache(async (id: string): Promise<VideoDetail | null> => {
    return getOrSet(`video/${id}`, () => _scrapeVideoDetail(id));
});
