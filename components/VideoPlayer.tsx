'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    src: string;
    poster: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Imperatively load the source
        video.src = src;
        // video.load(); // Standard browsers will load on src assignment or autoPlay, but explicit load is safer

        // Handle cleanup explicitly
        return () => {
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.removeAttribute('src'); // Fully detach source
                video.load(); // Force unload
            }
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            className="h-full w-full"
            poster={poster}
        // src={src} // Controlled manually via useEffect
        >
            Your browser does not support the video tag.
        </video>
    );
}
