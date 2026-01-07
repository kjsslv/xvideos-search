import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Generates a sharded file path based on the key's MD5 hash.
 * Strategy: data/ab/cd/friendly-name.json
 */
function getShardPath(key: string): string {
    const hash = createHash('md5').update(key).digest('hex');
    const level1 = hash.substring(0, 2);
    const level2 = hash.substring(2, 4);

    // Replace slashes with dashes to keep the file flat within the shard
    const safeFilename = key.replace(/[\/\\]/g, '-');

    return path.join(DATA_DIR, level1, level2, `${safeFilename}.json`);
}

/**
 * Retrieves data from a local JSON file if it exists, otherwise executes the fetcher
 * function, saves the result to the file, and returns the data.
 * 
 * @param key The unique key for the data, used as the file path (relative to /data)
 * @param fetcher The async function to fetch data if cache is missing
 * @returns The data of type T
 */
export async function getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>
): Promise<T> {
    const filePath = getShardPath(key);

    try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        try {
            // Check file stats for expiration
            const stats = await fs.stat(filePath);
            const now = Date.now();
            const ageMs = now - stats.mtimeMs;
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

            // Try reading the file
            const fileContent = await fs.readFile(filePath, 'utf-8');
            // If empty file, throw to trigger fetch
            if (!fileContent.trim()) throw new Error("Empty file");

            const data = JSON.parse(fileContent);

            if (ageMs > sevenDaysMs) {
                // Stale-While-Revalidate: Return stale data, update in background
                fetcher().then(async (newData) => {
                    if (newData !== null && newData !== undefined) {
                        try {
                            await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
                        } catch (err) {
                            console.error("Background cache update failed:", err);
                        }
                    }
                }).catch(err => console.error("Background fetch failed:", err));

                return data;
            }

            return data;
        } catch (readError) {
            // File doesn't exist, is empty, invalid JSON, or other FS error
            // Proceed to fetch (synchronously)
        }

        const data = await fetcher();

        // Only save if data is not null/undefined
        if (data !== null && data !== undefined) {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }

        return data;
    } catch (error) {
        // Fallback: try to fetch without saving if file system fails, or rethrow
        return await fetcher();
    }
}
