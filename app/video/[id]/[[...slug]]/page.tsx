import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";
import VideoIframeWrapper from "@/components/VideoIframeWrapper";
import { notFound, redirect } from "next/navigation";
import { getVideoDetail } from "@/lib/scraper";
import { slugify, slugifySearchQuery, base64UrlDecode } from "@/lib/utils";

interface Props {
    params: Promise<{ id: string, slug?: string[] }>;
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    const decodedId = base64UrlDecode(id);
    const video = await getVideoDetail(decodedId);
    if (!video) return { title: "Video Not Found" };
    return {
        title: `${video.title} - Free Porn Video on PhimSex.boo`,
        description: `Watch ${video.title} - free porn video on PhimSex.boo. Discover more xxx movies and hd sex clips related to this video.`,
        openGraph: {
            title: `${video.title} - Free Porn Video`,
            description: `Watch ${video.title} on PhimSex.boo`,
            images: [video.thumbnail],
            type: 'video.movie',
        }
    }
}

export default async function VideoPage({ params }: Props) {
    const { id, slug } = await params;
    const decodedId = base64UrlDecode(id);
    const video = await getVideoDetail(decodedId);

    if (!video) return notFound();

    // Redirect logic
    // Slice to 30 chars effectively to match URL generation
    const expectedSlug = slugify(video.title).slice(0, 30).replace(/-+$/, '');
    const currentSlug = slug?.[0]; // [[...slug]] returns array

    if (expectedSlug && currentSlug !== expectedSlug) {
        redirect(`/video/${id}/${expectedSlug}`);
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
            <Navbar />
            <div className="mx-auto max-w-screen-xl px-4 py-8">

                {/* Video Player Section - Full Width */}
                <div className="mb-10">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10">
                        <VideoIframeWrapper videoId={id} thumbnail={video.thumbnail} />
                    </div>

                    <h1 className="mt-4 text-2xl lg:text-3xl font-bold text-white">{video.title}</h1>
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <span className="font-semibold text-white">Views:</span> {video.views || "N/A"}
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="font-semibold text-white">Duration:</span> {video.duration}
                        </span>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {video.tags.map((tag, idx) => (
                                <a
                                    key={idx}
                                    href={`/s/${slugifySearchQuery(tag)}.html`}
                                    className="px-3 py-1 bg-zinc-800 hover:bg-red-600 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                                >
                                    #{tag}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 my-8"></div>

                {/* Related Videos - 4 Columns Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-red-500 pl-4 uppercase tracking-wide">
                        Related Videos
                    </h2>

                    {video.related && video.related.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Display ALL related videos, no slice */}
                            {video.related.map((vid) => (
                                <VideoCard key={vid.id} video={vid} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No related videos found.</p>
                    )}
                </div>
            </div>
        </main>
    );
}
