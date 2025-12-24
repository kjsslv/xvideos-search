import { fetchHtml } from './lib/scraper';

async function testUrl(url: string) {
    console.log(`Testing: ${url}`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
    } catch (e) {
        console.error("Error fetching:", e);
    }
}

async function run() {
    // ID from previous log: 81369555
    // Need to find the EID corresponding to this or just use the EID found in the log if I could see it.
    // I will try to fetch the search again and pick the first EID dynamically to be safe.

    // Actually, let's just use the scraper's fetch methodology to get an EID.
    const searchUrl = `https://www.xvideos.com/?k=Jav+HD&quality=hd`;
    const html = await fetchHtml(searchUrl);
    const eidMatch = html.match(/data-eid="([^"]+)"/);

    if (eidMatch) {
        const eid = eidMatch[1];
        console.log(`Found EID: ${eid}`);
        await testUrl(`https://www.xvideos.com/video.${eid}/a`);
    } else {
        console.log("No EID found in search results.");
    }
}

run();
