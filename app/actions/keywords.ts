'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface Keyword {
    id: number;
    text: string;
}

export type GetKeywordsResult = {
    keywords: Keyword[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export async function getKeywords({
    page = 1,
    limit = 20,
    search = '',
}: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<GetKeywordsResult> {
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM keywords';
    let countQuery = 'SELECT COUNT(*) as count FROM keywords';
    const params: (string | number)[] = [];

    if (search) {
        const searchClause = ' WHERE text LIKE ?';
        query += searchClause;
        countQuery += searchClause;
        params.push(`%${search}%`);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    // params for main query: [search?, limit, offset]
    const listParams = [...params, limit, offset];

    // params for count query: [search?]
    const countParams = [...params];

    try {
        const keywords = db.prepare(query).all(...listParams) as Keyword[];
        const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
        const total = countResult.count;

        return {
            keywords,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error fetching keywords:', error);
        throw new Error('Failed to fetch keywords');
    }
}

export async function createKeyword(text: string): Promise<{ success: boolean; error?: string }> {
    try {
        db.prepare('INSERT INTO keywords (text) VALUES (?)').run(text.trim());
        revalidatePath('/dashboard/keywords');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, error: 'Keyword already exists' };
        }
        console.error('Error creating keyword:', error);
        return { success: false, error: 'Failed to create keyword' };
    }
}

export async function updateKeyword(id: number, text: string): Promise<{ success: boolean; error?: string }> {
    try {
        db.prepare('UPDATE keywords SET text = ? WHERE id = ?').run(text.trim(), id);
        revalidatePath('/dashboard/keywords');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, error: 'Keyword already exists' };
        }
        console.error('Error updating keyword:', error);
        return { success: false, error: 'Failed to update keyword' };
    }
}

export async function deleteKeyword(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        db.prepare('DELETE FROM keywords WHERE id = ?').run(id);
        revalidatePath('/dashboard/keywords');
        return { success: true };
    } catch (error) {
        console.error('Error deleting keyword:', error);
        return { success: false, error: 'Failed to delete keyword' };
    }
}

export async function createKeywords(text: string): Promise<{ success: boolean; created: number; errors: number }> {
    const keywords = text.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    let created = 0;
    let errors = 0;

    // Use INSERT OR IGNORE to handle duplicates efficiently without exceptions
    const stmt = db.prepare('INSERT OR IGNORE INTO keywords (text) VALUES (?)');

    const transaction = db.transaction((lines) => {
        for (const line of lines) {
            try {
                const info = stmt.run(line);
                if (info.changes > 0) {
                    created++;
                } else {
                    // Duplicate found (changes === 0)
                    errors++;
                }
            } catch (error) {
                console.error('Error inserting keyword:', line, error);
                errors++;
            }
        }
    });

    try {
        transaction(keywords);
        revalidatePath('/dashboard/keywords');
        return { success: true, created, errors };
    } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, created: 0, errors: keywords.length };
    }
}

export async function deleteKeywords(ids: number[]): Promise<{ success: boolean; error?: string }> {
    if (!ids.length) return { success: true };
    try {
        const placeholders = ids.map(() => '?').join(',');
        db.prepare(`DELETE FROM keywords WHERE id IN (${placeholders})`).run(...ids);
        revalidatePath('/dashboard/keywords');
        return { success: true };
    } catch (error) {
        console.error('Error deleting keywords:', error);
        return { success: false, error: 'Failed to delete keywords' };
    }
}
