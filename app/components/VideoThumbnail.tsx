"use client";

import { useEffect, useRef, useState } from "react";

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

/**
 * Captures a single frame from the middle of a video using an off-screen
 * <video> + <canvas> — no FFmpeg required, pure browser-side.
 */
export default function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  const [thumb, setThumb] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const capture = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 320;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL("image/jpeg", 0.8));
      // Clean up — we no longer need the video element
      video.src = "";
      video.load();
    };

    const onSeeked = () => capture();

    const onMetadata = () => {
      // Seek to 50% of the video duration
      const mid = video.duration ? video.duration * 0.5 : 0;
      video.currentTime = mid;
    };

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", onSeeked);

    video.src = src;
    video.preload = "metadata";
    video.muted = true;
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [src]);

  return (
    <>
      {/* Hidden elements used only for thumbnail extraction */}
      <video ref={videoRef} style={{ display: "none" }} crossOrigin="anonymous" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt="video thumbnail"
          className={className}
        />
      ) : (
        /* Loading state — gray placeholder with spinner */
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
      )}
    </>
  );
}
