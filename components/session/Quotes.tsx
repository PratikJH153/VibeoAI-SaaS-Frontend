"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Link } from "lucide-react";
import {
  dummyInsights,
  dummyTranscripts,
  dummySessions,
} from "@/lib/dummy-data";
import { formatTime } from "@/utils/format_time";

export default function Quotes({ sessionId }: { sessionId?: string | number }) {
  const quotes = useMemo(() => {
    // derive a list of quote-like items from dummyInsights: pick first quote per insight
    const all: any[] = [];
    for (const entry of dummyInsights as any[]) {
      for (const ins of entry.insights ?? []) {
        const q = (ins.quotes && ins.quotes[0]) || ins.summary || null;
        if (!q) continue;
        all.push({
          id: String(ins.id ?? `${entry.session_id}-${all.length}`),
          text: q,
          speaker: ins.speaker ?? entry.speaker ?? `Speaker`,
          start_time: Number(entry.start_time ?? ins.start_time ?? 0),
          thumbnail: dummySessions[0]?.thumbnail,
        });
      }
    }
    return all.slice(0, 8);
  }, []);

  if (!quotes.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Quotes
        </h3>
        <p className="text-sm text-slate-500">
          No quotes available for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-y">
      <div className="relative max-h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Top Quotes
        </h3>
        <div className="space-y-4 max-h-[600px] ">
          {quotes.slice(1, 4).map((q) => (
            <div
              key={q.id}
              className="flex gap-4 items-start bg-gradient-to-r from-white/50 to-slate-50 dark:from-slate-900/40 dark:to-slate-900/30 rounded-xl p-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
            >
              <div className="w-40 h-24 rounded-md overflow-hidden bg-slate-200 flex-shrink-0">
                <img
                  src={q.thumbnail}
                  className="w-full h-full object-cover"
                  alt="thumb"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {q.speaker}
                  </h4>
                  <span className="text-sm text-slate-500">
                    {formatTime(q.start_time)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                  "{q.text}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {q.text.slice(0, 140)}
                  {q.text.length > 140 ? "\u2026" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Link className="w-4 h-4" /> Copy Link
                </Button>
                <Button className="flex items-center gap-2 bg-blue-600 text-white">
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Locked / Coming soon overlay: placed INSIDE the card so it only covers this card.
            Uses a stronger blur and slightly darker overlay to make the locked state more visible.
            pointer-events-none on wrapper allows underlying layout not to be blocked globally; the inner
            overlay uses pointer-events-auto so it can be made interactive if needed in future. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl">
          <div className="pointer-events-auto w-full h-full rounded-2xl bg-white/60 dark:bg-slate-900/64 backdrop-blur-md flex items-center justify-center">
            <div className="text-center px-6 py-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-white/60 dark:bg-slate-800/60 flex items-center justify-center border border-white/70 dark:border-slate-700">
                {/* simple lock icon using an emoji to avoid extra deps; lucide-react could be used if preferred */}
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                Locked
              </h4>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Coming soon — stay tuned for this update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
