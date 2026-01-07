import { getKeywords } from '@/app/actions/keywords';
import KeywordClient from './keyword-client';

export const dynamic = 'force-dynamic';

export default async function KeywordsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const search = (searchParams.search as string) || '';
    const limit = 100;

    const { keywords, total, totalPages } = await getKeywords({ page, limit, search });

    return (
        <KeywordClient
            initialKeywords={keywords}
            total={total}
            currentPage={page}
            totalPages={totalPages}
        />
    );
}
