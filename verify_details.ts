import { getVideoDetail } from './lib/scraper';

async function run() {
    const id = '34330977';
    console.log(`Getting detail for ${id}...`);
    const detail = await getVideoDetail(id);

    if (detail) {
        console.log("Title:", detail.title);
        console.log("Tags:", detail.tags);
        console.log("Views:", detail.views);
        console.log("Duration:", detail.duration);
    } else {
        console.log("Detail not found.");
    }
}

run();
