"use client";

import { motion } from "framer-motion";
import { User, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { formatTime } from "@/utils/format_time";

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
}

interface TranscriptPanelProps {
  transcripts: TranscriptItem[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  onAddToNotes?: (content: string, timestamp?: number) => void;
}

export function TranscriptPanel({
  transcripts,
  currentTime = 0,
  onSeek,
  onAddToNotes,
}: TranscriptPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeIndex = transcripts.findIndex(
    (t) => currentTime >= t.start_time && currentTime <= t.end_time
  );

  useEffect(() => {
    if (activeIndex === -1) return;
    const active = transcripts[activeIndex];
    const el = itemRefs.current[active.id];
    const viewport = viewportRef.current;
    if (el && viewport) {
      // compute position of element relative to viewport and scroll smoothly
      const elTop = el.offsetTop;
      const elHeight = el.offsetHeight;
      const vpHeight = viewport.clientHeight;
      const target = Math.max(0, elTop - vpHeight / 2 + elHeight / 2);
      viewport.scrollTo({ top: target, behavior: "smooth" });
      // focus for keyboard users
      el.focus({ preventScroll: true });
    }
  }, [activeIndex, transcripts]);

  const isActive = (start: number, end: number) => {
    return currentTime >= start && currentTime <= end;
  };

  const handleSeek = (seconds: number) => {
    // call prop if provided
    if (onSeek) onSeek(seconds);
    // dispatch a DOM event so other components (video player, transcripts) can listen
    try {
      const ev = new CustomEvent("vibeo-seek", { detail: { seconds } });
      window.dispatchEvent(ev);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-transparent h-full">
      {/* <div className="p-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Transcript
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Click any segment to jump
        </p>
      </div> */}

      <ScrollArea className="h-full" viewportRef={viewportRef}>
        <div className="p-1 space-y-1">
          {transcripts.map((item, index) => {
            // keep per-item animation delay tiny and bounded so jumping to far items
            // doesn't wait for a long index*delay sequence. If there's an active
            // index, base the delay on distance to that active item so nearby
            // items animate slightly staggered; otherwise use a small default.
            const animDelay = (() => {
              const MAX_DELAY = 0.12; // seconds
              if (activeIndex === -1) {
                // initial mount: slight stagger but with small multiplier
                return Math.min(index * 0.005, MAX_DELAY);
              }
              return Math.min(Math.abs(index - activeIndex) * 0.01, MAX_DELAY);
            })();

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animDelay }}
                onClick={() => handleSeek(item.start_time)}
                ref={(el: HTMLDivElement | null) =>
                  (itemRefs.current[item.id] = el)
                }
                tabIndex={-1}
                aria-current={
                  isActive(item.start_time, item.end_time) ? "true" : undefined
                }
                className={`group p-3 rounded-lg transition-all cursor-pointer ${
                  isActive(item.start_time, item.end_time)
                    ? "bg-white/60 dark:bg-white/[0.02] border border-purple-200 dark:border-blue-900/20 shadow-sm"
                    : "hover:bg-white/20 dark:hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.speaker === 'Interviewer'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <User className={`w-5 h-5 ${
                      item.speaker === 'Interviewer'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                </div> */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.speaker}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.start_time)}
                      </span>
                    </div>

                    <div className="relative">
                      <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
