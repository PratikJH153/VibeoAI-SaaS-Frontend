"use client";

import { motion } from "framer-motion";
import { Sparkles, Tag, Clock, Plus, Divide } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTime } from "@/utils/format_time";

interface Note {
  id: string;
  content: any;
  tags: string[];
  timestamp_ref?: number;
  is_ai_generated: boolean;
}

interface AINotesPanelProps {
  notes: Note[];
  onAddNote?: () => void;
  insights?: { theme: string; detailed_analysis?: string }[];
  onAddToNotes?: (content: string, timestamp?: number) => void;
  // optional callback to seek the video player to a given time (seconds)
  onSeek?: (seconds: number) => void;
}

export function AINotesPanel({
  notes,
  onAddNote,
  insights,
  onAddToNotes,
  onSeek,
}: AINotesPanelProps) {
  // Load id->timestamp mapping. We import the JSON at runtime so Next can bundle it.
  // The file is in the data/ folder at project root.
  // Use require to avoid TS/ESM import issues in Next client component.
  let idsToTimestamps: Record<string, number> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    idsToTimestamps = require("@/data/ids_to_timestamps_95b5d907-0d2.json");
  } catch (e) {
    // fallback empty
    idsToTimestamps = {};
  }

  const formatTimestamp = (seconds?: number) => {
    if (seconds == null || Number.isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to extract a numeric seconds value from the mapping entry.
  const getSecondsFromMapping = (id?: string): number | null => {
    if (!id) return null;
    const v: any = idsToTimestamps[id];
    if (v == null) return null;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseFloat(v);
      return Number.isNaN(n) ? null : n;
    }
    if (Array.isArray(v)) {
      return v[0];
    }
    return null;
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

  const extractTextFromContent = (content: any): string => {
    if (typeof content === "string") return content;
    if (content?.content?.[0]?.content?.[0]?.text) {
      return content.content[0].content[0].text;
    }
    return "No content";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-bg h-full overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 " />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Insights
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 ">
          Automatically generated highlights and key moments
        </p>
      </div>

      <ScrollArea className="h-full">
        <div className="px-2 space-y-1">
          {/* Render insights (theme + detailed analysis) first when available */}
          {insights && insights.length > 0 && (
            <div className="space-y-4">
              {insights.slice(0, 1).map((ins, i) => (
                <motion.div
                  key={`ins-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 "
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ins.theme}
                    </h2>
                  </div>
                  <div className="prose max-w-full dark:prose-invert text-md">
                    {/* Normalize detailed_analysis to string and convert #id=N# tokens into markdown links like [00:12](#id=12#) */}
                    {(() => {
                      let raw = ins.detailed_analysis ?? "";
                      if (typeof raw !== "string") {
                        try {
                          raw = JSON.stringify(raw);
                        } catch (e) {
                          raw = String(raw);
                        }
                      }

                      // raw = raw.slice(0, raw.indexOf("Key Insights"));

                      // replace all #id=NN# with a markdown link that we will intercept in the renderer
                      const replaced = raw.replace(/#id=(\d+)#/g, (_, id) => {
                        const seconds = getSecondsFromMapping(id);
                        const label =
                          formatTimestamp(seconds ?? undefined) ?? `id:${id}`;
                        // put the id back in the destination so link renderer can pick it up
                        return `[${label}](#id=${id}#)`;
                      });

                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => {
                              // expect href like '#id=12#'
                              if (!href?.startsWith("#id=")) {
                                return <a href={href}>{children}</a>;
                              }
                              const m = href.match(/^#id=(\d+)#$/);
                              const id = m?.[1];
                              const seconds = id
                                ? getSecondsFromMapping(id) ?? 0
                                : 0;
                              return (
                                <button
                                  onClick={() => handleSeek(seconds)}
                                  className="text-blue-600 dark:text-blue-400 underline mr-1"
                                  title={`Jump to ${children}`}
                                >
                                  {children}
                                </button>
                              );
                            },
                          }}
                        >
                          {replaced}
                        </ReactMarkdown>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {/* {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {note.is_ai_generated && (
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      AI Generated
                    </span>
                  </div>
                )}

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {extractTextFromContent(note.content)}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.replace("_", " ")}
                    </Badge>
                  ))}
                  {note.timestamp_ref && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(note.timestamp_ref)}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No insights yet. AI will generate notes as you watch.
              </p>
            </div>
          )} */}
        </div>
      </ScrollArea>
    </div>
  );
}
