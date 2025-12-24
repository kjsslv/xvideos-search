import { getVideoDetail } from './lib/scraper';

async function run() {
    const id = '34330977';
    console.log(`Checking related videos for ${id}...`);
    const detail = await getVideoDetail(id);
    if (detail && detail.related) {
        console.log(`Found ${detail.related.length} related videos.`);
        detail.related.forEach((v, i) => {
            if (!v.title) {
                console.log(`[Index ${i}] Missing title!`, v);
            } else if (typeof v.title !== 'string') {
                console.log(`[Index ${i}] Title is not string!`, v);
            }
        });
        if (detail.related.length > 0) {
            console.log("First related:", detail.related[0]);
        }
    } else {
        console.log("No detail or related found.");
    }
}

run();
