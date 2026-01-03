import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

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
    const filePath = path.join(DATA_DIR, `${key}.json`);

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

            if (ageMs > sevenDaysMs) {
                console.log(`[Repository] Cache EXPIRED: ${key} (Age: ${ageMs / 1000}s)`);
                // Proceed to fetch logic below by throwing
                throw new Error("Cache expired");
            }

            // Try reading the file
            const fileContent = await fs.readFile(filePath, 'utf-8');
            // If empty file, throw to trigger fetch
            if (!fileContent.trim()) throw new Error("Empty file");

            const data = JSON.parse(fileContent);
            console.log(`[Repository] Cache HIT: ${key}`);
            return data;
        } catch (readError) {
            // File doesn't exist, is empty, invalid JSON, or EXPIRED
            // Proceed to fetch
        }

        console.log(`[Repository] Cache MISS: ${key} - Fetching...`);
        const data = await fetcher();

        // Only save if data is not null/undefined
        if (data !== null && data !== undefined) {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[Repository] Saved to: ${filePath}`);
        }

        return data;

    } catch (error) {
        console.error(`[Repository] Error in getOrSet for ${key}:`, error);
        // Fallback: try to fetch without saving if file system fails, or rethrow
        return await fetcher();
    }
}
