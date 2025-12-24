import Link from "next/link";
// import { base64UrlEncode } from "@/lib/utils";
import { Video } from "@/lib/scraper";
import { Play } from "lucide-react";

export default function VideoCard({ video }: { video: Video }) {
    return (
        <Link href={video.url} className="group relative block overflow-hidden rounded-xl bg-zinc-900 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-red-500/20">
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-red-600 p-3 text-white shadow-lg">
                        <Play fill="currentColor" size={24} />
                    </div>
                </div>

                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white">
                    {video.duration}
                </span>
            </div>
            <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-200 group-hover:text-red-400">
                    {video.title}
                </h3>
            </div>
        </Link>
    );
}
