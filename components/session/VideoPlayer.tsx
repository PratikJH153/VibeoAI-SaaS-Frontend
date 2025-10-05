"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/utils/format_time";

// Using native HTML5 <video> for reliability. ReactPlayer was removed.

interface Marker {
  timestamp: number;
  label: string;
  color: string;
}

interface VideoPlayerProps {
  url: string;
  markers?: Marker[];
  onProgress?: (progress: { playedSeconds: number }) => void;
  // optional ref from parent to allow external components to request a seek
  seekRef?: React.MutableRefObject<((seconds: number) => void) | null>;
}

export function VideoPlayer({
  url,
  markers = [],
  onProgress,
  seekRef,
}: VideoPlayerProps) {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // keep native video element in sync with state
  useEffect(() => {
    // mark as mounted (client-only) to avoid SSR rendering the <video>
    setMounted(true);
    if (!videoRef.current) return;
    try {
      if (playing) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    } catch (e) {
      // ignore
    }
  }, [playing]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    if (volume === 0) setMuted(true);
  }, [volume]);

  // update duration once metadata is loaded
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  const seekToSeconds = (seconds: number) => {
    try {
      if (videoRef.current) videoRef.current.currentTime = seconds;
    } catch (err) {
      // ignore
    }
  };

  // expose seek function to parent if a ref was provided
  useEffect(() => {
    if (!seekRef) return;
    seekRef.current = seekToSeconds;
    return () => {
      if (seekRef) seekRef.current = null;
    };
  }, [seekRef]);

  // listen for global seek events so other components (like AINotesPanel) can trigger seeks
  useEffect(() => {
    const onVibeoSeek = (e: Event) => {
      try {
        // CustomEvent with detail.seconds
        const ce = e as CustomEvent<{ seconds: number }>;
        const seconds = ce?.detail?.seconds;
        if (typeof seconds === "number" && !Number.isNaN(seconds)) {
          seekToSeconds(seconds);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("vibeo-seek", onVibeoSeek as EventListener);
    return () =>
      window.removeEventListener("vibeo-seek", onVibeoSeek as EventListener);
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
        ref={containerRef}
      >
        {/* Render a lightweight placeholder on the server, mount full video on client */}
        {!mounted ? (
          <div className="w-full h-full bg-slate-900" />
        ) : (
          <video
            ref={videoRef}
            src={
              // proxy GCS-hosted URLs through our local API to avoid CORS
              (
                url ||
                "https://storage.googleapis.com/saas-videos/test/compressed.mp4"
              ).includes("storage.googleapis.com")
                ? `/api/proxy?url=${encodeURIComponent(
                    url ||
                      "https://storage.googleapis.com/saas-videos/test/compressed.mp4"
                  )}`
                : url
            }
            className="w-full h-full object-cover"
            playsInline
            crossOrigin="anonymous"
            onLoadedMetadata={() =>
              setDuration(videoRef.current?.duration || 0)
            }
            onTimeUpdate={(e) => {
              const current = (e.target as HTMLVideoElement).currentTime;
              setPlayed(duration ? current / duration : 0);
              onProgress?.({ playedSeconds: current });
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={(e) => {
              console.error("native video error", e);
              setPlaybackError("Failed to play video");
            }}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
          {/* Progress / seek slider */}
          <div className="mb-2">
            <Slider
              value={[played * duration * 100 || 0]}
              max={duration * 100 || 100}
              onValueChange={(v) => {
                const seconds = (v[0] || 0) / 100;
                seekToSeconds(seconds);
              }}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="p-2 bg-white/10 rounded"
              >
                {playing ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>

              <button onClick={() => setMuted((m) => !m)} className="p-2">
                {muted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <Slider
                value={[muted ? 0 : volume * 100]}
                onValueChange={(v) => {
                  const vol = v[0] / 100;
                  setVolume(vol);
                  if (videoRef.current) {
                    videoRef.current.volume = vol;
                    // if volume > 0 unmute
                    if (vol > 0 && videoRef.current.muted) {
                      videoRef.current.muted = false;
                      setMuted(false);
                    }
                  }
                }}
                max={100}
                className="w-32"
              />

              <div className="text-sm text-white/80">
                {formatTime(videoRef.current?.currentTime || 0)} /{" "}
                {formatTime(duration)}
              </div>
            </div>

            <button className="p-2">
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {playbackError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-700 text-white px-3 py-2 rounded">
              Playback error: {playbackError}
            </div>
          </div>
        )}
      </motion.div>

      {markers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {markers.map((m, i) => {
            const isSelected = selectedMarker === i;
            return (
              <button
                key={i}
                onClick={() => {
                  seekToSeconds(m.timestamp);
                  setSelectedMarker(i);
                }}
                className={`flex items-center gap-2 px-1 py-2 rounded-full text-sm transition-all focus:outline-none focus:ring-2 ${
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "bg-slate-100/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:scale-[1.02]"
                }`}
                style={{
                  border: `1px solid ${m.color}20`,
                }}
                title={`${m.label} — ${formatTime(m.timestamp)}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-white dark:bg-slate-700" : ""
                  }`}
                  style={{ background: isSelected ? m.color : undefined }}
                  aria-hidden
                >
                  {isSelected ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: m.color }}
                    />
                  )}
                </span>
                <span className="whitespace-nowrap">{m.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  {formatTime(m.timestamp)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
