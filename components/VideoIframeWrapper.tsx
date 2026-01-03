'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoIframeWrapperProps {
    videoId: string;
    thumbnail: string;
}

export default function VideoIframeWrapper({ videoId, thumbnail }: VideoIframeWrapperProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <iframe
                src={`/embed.html?id=${videoId}&thumb=${encodeURIComponent(thumbnail)}`}
                className="w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; fullscreen"
            />
        );
    }

    return (
        <div
            className="group relative w-full h-full cursor-pointer"
            onClick={() => setIsPlaying(true)}
        >
            {/* Thumbnail Image */}
            <img
                src={thumbnail}
                alt="Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                {/* Play Button */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current ml-1" />
                </div>
            </div>
        </div>
    );
}
