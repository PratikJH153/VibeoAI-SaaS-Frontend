"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Check,
  Minimize,
  SkipForward,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/utils/format_time";

import themesData from "@/data/themes_to_timestamps_95b5d907-0d2.json";
import { getColorForTheme } from "@/lib/theme-colors";

// Using native HTML5 <video> for reliability. ReactPlayer was removed.

interface Marker {
  timestamp: number;
  label: string;
  color: string;
}

interface ThemeSegment {
  name: string;
  start: number;
  end: number;
  color?: string;
}

interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: { playedSeconds: number }) => void;
  // optional ref from parent to allow external components to request a seek
  seekRef?: React.MutableRefObject<((seconds: number) => void) | null>;
  // optional theme segments for the timeline (seconds)
  themes?:
    | Array<ThemeSegment>
    | Record<string, { start_time: number; end_time: number }>;
  // callback invoked when a theme is selected (by clicking on the timeline)
  onThemeSelect?: (themeName: string | null) => void;
}

export function VideoPlayer({
  url,
  onProgress,
  seekRef,
  themes,
  onThemeSelect,
}: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // compute themes from prop or fallback JSON
  const computedThemes: ThemeSegment[] = useMemo(() => {
    if (!themes) {
      const src: any = themesData ?? {};
      return Object.entries(src).map(([name, t], i) => ({
        name,
        start: (t as any).start_time,
        end: (t as any).end_time,
        color: getColorForTheme(name),
      }));
    }

    if (Array.isArray(themes)) return themes as ThemeSegment[];

    // object map provided
    return Object.entries(themes as Record<string, any>).map(([name, t]) => ({
      name,
      start: (t as any).start_time,
      end: (t as any).end_time,
      color: getColorForTheme(name),
    }));
  }, [themes]);

  // compute unique theme boundary timestamps (start/end) for rendering dividers
  const themeBoundaries = useMemo(() => {
    if (!computedThemes || computedThemes.length === 0 || !duration)
      return [] as number[];
    const s = new Set<number>();
    computedThemes.forEach((t) => {
      if (typeof t.start === "number") s.add(t.start);
      if (typeof t.end === "number") s.add(t.end);
    });
    return Array.from(s)
      .filter((v) => v > 0 && v < duration)
      .sort((a, b) => a - b);
  }, [computedThemes, duration]);

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

  // Seek to the start of the next theme segment given current playback time.
  const skipToNextTheme = () => {
    try {
      if (!videoRef.current || !duration || !computedThemes) return;
      const current = videoRef.current.currentTime || 0;
      // find first theme whose start is strictly greater than current time + small epsilon
      const epsilon = 0.001;
      const sorted = computedThemes
        .slice()
        .filter((t) => typeof t.start === "number")
        .sort((a, b) => a.start - b.start);
      const next = sorted.find((t) => t.start > current + epsilon);
      if (next) {
        seekToSeconds(next.start);
        try {
          if (onThemeSelect) {
            lastNotifiedThemeRef.current = next.name;
            onThemeSelect(next.name);
          }
        } catch (err) {
          // ignore
        }
      } else {
        // if none found, optionally jump to end or do nothing. We'll jump to video end.
        seekToSeconds(duration);
        try {
          if (onThemeSelect) {
            lastNotifiedThemeRef.current = null;
            onThemeSelect(null);
          }
        } catch (err) {
          // ignore
        }
      }
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
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);

  const [hoveredTheme, setHoveredTheme] = useState<ThemeSegment | null>(null);
  const [tooltipPageX, setTooltipPageX] = useState<number>(0);
  const [tooltipPageY, setTooltipPageY] = useState<number>(0);
  // track last theme we notified parent about to avoid spamming callbacks
  const lastNotifiedThemeRef = useRef<string | null>(null);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredTheme(null);
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative aspect-video  bg-slate-900 rounded-2xl overflow-hidden shadow-2xl h-full"
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
            className="w-full h-full object-contain bg-black"
            playsInline
            crossOrigin="anonymous"
            onLoadedMetadata={() =>
              setDuration(videoRef.current?.duration || 0)
            }
            onTimeUpdate={(e) => {
              const current = (e.target as HTMLVideoElement).currentTime;
              setPlayed(duration ? current / duration : 0);
              onProgress?.({ playedSeconds: current });
              try {
                if (computedThemes && computedThemes.length > 0) {
                  const found = computedThemes.find(
                    (t) => current >= t.start && current <= t.end
                  );
                  const name = found ? found.name : null;
                  if (onThemeSelect && lastNotifiedThemeRef.current !== name) {
                    lastNotifiedThemeRef.current = name;
                    onThemeSelect(name);
                  }
                }
              } catch (err) {
                // ignore
              }
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
          <div
            className="mb-2 relative"
            ref={sliderContainerRef}
            onMouseMove={(e) => {
              if (!sliderContainerRef.current || !duration) return;
              const rect = sliderContainerRef.current.getBoundingClientRect();
              const x = (e.clientX ?? 0) - rect.left;
              const pct = Math.max(0, Math.min(1, x / rect.width));
              const seconds = pct * duration;
              // store page coords for fixed tooltip
              setTooltipPageX(e.clientX);
              setTooltipPageY(rect.top - 10);
              if (computedThemes && computedThemes.length > 0) {
                const found = computedThemes.find(
                  (t) => seconds >= t.start && seconds <= t.end
                );
                if (found) setHoveredTheme(found as ThemeSegment);
                else setHoveredTheme(null);
              }
            }}
            onClick={(e) => {
              if (!sliderContainerRef.current || !duration) return;
              const rect = sliderContainerRef.current.getBoundingClientRect();
              const x = (e.clientX ?? 0) - rect.left;
              const pct = Math.max(0, Math.min(1, x / rect.width));
              const seconds = pct * duration;
              seekToSeconds(seconds);
              // also determine which theme was clicked (if any) and notify parent
              try {
                if (computedThemes && computedThemes.length > 0) {
                  const found = computedThemes.find(
                    (t) => seconds >= t.start && seconds <= t.end
                  );
                  if (onThemeSelect) onThemeSelect(found ? found.name : null);
                }
              } catch (err) {
                // ignore
              }
            }}
          >
            {/* Segmented theme background - rendered beneath the slider so native slider interaction remains */}
            {isHovered && (
              <div className="absolute inset-0 h-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative h-3 w-full">
                  {computedThemes && duration > 0
                    ? computedThemes.map((t, i) => {
                        const rawLeft = (t.start / duration) * 100;
                        const rawRight = (t.end / duration) * 100;
                        // clamp to avoid coloring the extreme edges
                        const left = Math.max(1, Math.min(99, rawLeft));
                        const right = Math.max(1, Math.min(99, rawRight));
                        const width = Math.max(0.5, right - left);
                        const bg = t.color ? t.color : "#60A5FA"; // default blue-400
                        return (
                          <div
                            key={i}
                            className="absolute top-0 h-3 rounded-sm"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              background: `${bg}`, // translucent
                              border: `1px solid ${bg}55`,
                            }}
                            aria-hidden
                          />
                        );
                      })
                    : null}
                  {/* Dividers at theme boundaries */}
                  {themeBoundaries && themeBoundaries.length > 0 && (
                    <div className="absolute inset-0 h-3 pointer-events-none">
                      {themeBoundaries.map((ts, i) => {
                        const pct = (ts / duration) * 100;
                        return (
                          <div
                            key={`div-${i}`}
                            aria-hidden
                            className="absolute top-0 h-3 bg-white rounded"
                            style={{
                              left: `${pct}%`,
                              width: 0,
                              borderLeft: `1px solid rgba(255,255,255,0.12)`,
                              transform: "translateX(-0.5px) translateY(0.5px)",
                              zIndex: 999,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Native slider on top */}
            <Slider
              value={[played * duration * 100 || 0]}
              max={duration * 100 || 100}
              onValueChange={(v) => {
                const seconds = (v[0] || 0) / 100;
                seekToSeconds(seconds);
              }}
              className="w-full relative z-10"
              trackClassName={isHovered ? "bg-primary/10" : undefined}
            />

            {/* Tooltip (shows when hovering a theme) - fixed so it appears above everything */}
            {hoveredTheme && (
              <div
                className="fixed z-[9999] pointer-events-none"
                style={{
                  left: tooltipPageX,
                  top: tooltipPageY,
                  transform: "translateX(-50%) translateY(-140%)",
                }}
              >
                <div
                  className="text-white text-sm px-3 py-2 rounded-lg shadow-lg"
                  style={{
                    background: `${hoveredTheme.color}CC`,
                    border: `2px solid ${hoveredTheme.color}`,
                    minWidth: 140,
                    textAlign: "center",
                  }}
                >
                  <div className="font-semibold">{hoveredTheme.name}</div>
                  <div className="text-xs opacity-90">
                    {formatTime(hoveredTheme.start)}
                  </div>
                </div>
              </div>
            )}
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // skipToNextTheme is defined below
                  skipToNextTheme();
                }}
                className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full"
              >
                <SkipForward className="w-3 h-3 text-white" />
                <span className="text-xs text-white">Skip to Next Theme</span>
              </button>

              <button className="p-2">
                {!isFullScreen ? (
                  <Maximize
                    className="w-4 h-4 text-white"
                    onClick={toggleFullscreen}
                  />
                ) : (
                  <Minimize
                    className="w-4 h-4 text-white"
                    onClick={toggleFullscreen}
                  />
                )}
              </button>
            </div>
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

      {/* markers UI omitted */}
    </div>
  );
}
