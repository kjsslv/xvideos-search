import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";
import { searchVideos } from "@/lib/scraper";

import type { Metadata } from "next";

export const revalidate = 3600; // ISR

export const metadata: Metadata = {
  title: "Pornse.org - Free Porn Videos, HD Sex Movies & XXX Clips",
  description: "Pornse.org is the best place to watch free porn videos and HD sex movies. Discover our huge collection of xxx clips and full-length porn movies.",
  alternates: {
    canonical: 'https://pornse.org',
  }
};

export default async function Home() {
  const videos = await searchVideos("");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      <Navbar />
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Recommended Videos Today</h2>
            <p className="text-sm text-gray-400 mt-1">Automatically curated video list</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </main>
  );
}
