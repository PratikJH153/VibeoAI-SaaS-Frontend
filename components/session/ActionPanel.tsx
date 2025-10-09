"use client";

import React, { useState } from "react";
import { AINotesPanel } from "./AINotesPanel";
import { TranscriptPanel } from "./TranscriptPanel";
import InsightsCardSection from "./InsightsCardSection";
import { Sparkles, FileText, MessageSquare } from "lucide-react";

const tabItems = [
  { key: "ai", label: "AI Notes", icon: Sparkles },
  { key: "transcript", label: "Transcript", icon: FileText },
  { key: "insights", label: "Insights", icon: MessageSquare },
];

interface ActionPanelProps {
  dummyInsights: any[];
  setActiveInsight: (insight: any) => void;
  setInsightDialogOpen: (open: boolean) => void;
  insightDialogOpen: boolean;
  activeInsight: any;
  addNoteButtonClick: () => void;
  notes: any[];
  transcripts: any[];
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export default function ActionPanel({
  dummyInsights = [],
  setActiveInsight = () => {},
  setInsightDialogOpen = () => {},
  insightDialogOpen = false,
  activeInsight = null,
  addNoteButtonClick = () => {},
  notes = [],
  transcripts = [],
  currentTime = 0,
  setCurrentTime = () => {},
}: ActionPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full h-full">
      <div className="flex w-full bg-transparent h-full">
        <div className="flex-1 h-full">
          {/* main content container: use full height to expand into available space */}
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            {/* right: content area */}
            <div className="flex-1 p-4 overflow-hidden h-full">
              <div className="h-full w-full bg-transparent rounded-lg overflow-hidden flex">
                <div className="flex-1 overflow-auto h-full">
                  {selectedIndex === 0 && (
                    <div className="h-full">
                      <AINotesPanel
                        notes={notes}
                        insights={dummyInsights}
                        onAddNote={addNoteButtonClick}
                        onAddToNotes={addNoteButtonClick}
                        onSeek={(s: number) => setCurrentTime(s)}
                      />
                    </div>
                  )}

                  {selectedIndex === 1 && (
                    <div className="h-full">
                      <TranscriptPanel
                        transcripts={transcripts}
                        currentTime={currentTime}
                        onSeek={(s: number) => setCurrentTime(s)}
                        onAddToNotes={addNoteButtonClick}
                      />
                    </div>
                  )}

                  {selectedIndex === 2 && (
                    <div className="h-full">
                      <InsightsCardSection
                        dummyInsights={dummyInsights}
                        setActiveInsight={setActiveInsight}
                        setInsightDialogOpen={setInsightDialogOpen}
                        insightDialogOpen={insightDialogOpen}
                        activeInsight={activeInsight}
                        addNoteButtonClick={addNoteButtonClick}
                      />
                    </div>
                  )}
                </div>

                <div className="ml-2 w-18 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl flex flex-col items-center gap-4 border border-slate-300 dark:border-slate-800 h-full">
                  {tabItems.map((t, idx) => {
                    const Icon = t.icon;
                    const selected = idx === selectedIndex;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setSelectedIndex(idx)}
                        aria-pressed={selected}
                        className={`w-full flex items-center gap-2 justify-center p-2 rounded-xl transition-colors focus:outline-none ${
                          selected
                            ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white"
                            : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            selected ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span className="sr-only">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
