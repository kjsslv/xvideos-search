import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";
import { searchVideos } from "@/lib/scraper";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const rawSlug = decodeURIComponent(slug);
    const query = rawSlug.replace('.html', '').replace(/-/g, ' ');

    // Capitalize each word for the title
    const capitalizedQuery = query.replace(/\b\w/g, c => c.toUpperCase());

    return {
        title: `${capitalizedQuery} Porn Video - Watch Free ${capitalizedQuery} Sex Movies - PhimSex.boo`,
        description: `Watch the best ${query} porn videos for free. Discover high quality ${query} sex movies and xxx clips on PhimSex.boo.`,
    };
}

export default async function SearchPage({
    params,
}: Props) {
    const { slug } = await params;

    // Remove .html extension and replace dashes with spaces if needed for the query
    // User wants URL: /s/tu-khoa.html
    // So slug will be "tu-khoa.html"
    const rawSlug = decodeURIComponent(slug);
    const query = rawSlug.replace('.html', '').replace(/-/g, ' ');

    const videos = await searchVideos(query);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-gray-100 pb-10">
            <Navbar />
            <div className="mx-auto max-w-screen-xl px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Results for: <span className="text-red-500 italic">"{query}"</span>
                    </h1>
                    <span className="text-gray-400 mt-2 md:mt-0 text-sm">
                        Found {videos.length} videos
                    </span>
                </div>

                {videos.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <p className="text-xl">No videos found for this query.</p>
                        <p className="text-sm mt-2">Try searching for something else?</p>
                    </div>
                )}
            </div>
        </main>
    );
}
