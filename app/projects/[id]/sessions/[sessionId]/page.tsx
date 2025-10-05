"use client";

import React, { useState } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { VideoPlayer } from "@/components/session/VideoPlayer";
import { TranscriptPanel } from "@/components/session/TranscriptPanel";
import { AINotesPanel } from "@/components/session/AINotesPanel";
import { NotesPanel } from "@/components/session/NotesPanel";
import { SelectionAddToNotes } from "@/components/session/SelectionAddToNotes";
import { useNotesStore } from "@/lib/store";
import Quotes from "@/components/session/Quotes";
import { TagsFilter } from "@/components/session/TagsFilter";
import { SentimentTimeline } from "@/components/analytics/SentimentTimeline";
import { SummaryCharts } from "@/components/analytics/SummaryCharts";
import { ThemesCloud } from "@/components/analytics/ThemesCloud";
import { RichTextEditor } from "@/components/reports/RichTextEditor";
import { GenerateReportModal } from "@/components/reports/GenerateReportModal";
import { ExecutiveSummaryEditor } from "@/components/reports/ExecutiveSummaryEditor";
import {
  dummySessions,
  dummyTranscripts,
  dummyNotes,
  dummyTimelineMarkers,
  dummySentimentData,
  dummyThemes,
  dummySummaryData,
  dummyInsights,
} from "@/lib/dummy-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionChatDrawer } from "@/components/session/SessionChatDrawer";
import { AddNoteDialog } from "@/components/session/AddNoteDialog";

// derive tags from top themes so filter options reflect actual data
const filterTags = (dummyThemes || []).slice(0, 6).map((t: any) => ({
  id: String(t.theme_name).replace(/\s+/g, "_").toLowerCase(),
  label: t.theme_name,
  color: "#8b5cf6",
}));

export default function SessionPage({
  params,
}: {
  params: { id: string; sessionId: string };
}) {
  const resolvedParams = (React as any).use
    ? (React as any).use(params as any)
    : params;
  const sessionId = resolvedParams.sessionId;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const seekRef = useRef<((seconds: number) => void) | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [showTranscriptButton, setShowTranscriptButton] = useState(true);
  const [sessionChatOpen, setSessionChatOpen] = useState(false);
  const [overviewChatOpen, setOverviewChatOpen] = useState(false);
  const [overviewAssistantText, setOverviewAssistantText] = useState<
    string | undefined
  >(undefined);

  const session =
    dummySessions.find((s) => String(s.id) === String(sessionId)) ??
    dummySessions[0];
  // prefer an explicit video URL when provided to preview a specific file
  const videoUrl =
    session?.video_url ||
    "https://storage.googleapis.com/saas-videos/test/compressed.mp4";

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // notes store actions
  const addNote = useNotesStore((s) => s.addNote);

  return (
    <MainLayout showTopNavBar={false}>
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {session.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Session analysis and insights
          </p>
        </motion.div>

        <Tabs defaultValue="session" className="space-y-6">
          <div className="flex items-center mb-4">
            <TabsList className="mr-auto">
              <TabsTrigger
                value="session"
                onClick={() => setShowTranscriptButton(true)}
              >
                Session View
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                onClick={() => setShowTranscriptButton(false)}
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="ai_overview"
                onClick={() => setShowTranscriptButton(false)}
              >
                AI Overview
              </TabsTrigger>
              <TabsTrigger
                value="quotes"
                onClick={() => setShowTranscriptButton(false)}
              >
                Quotes
              </TabsTrigger>

              <TabsTrigger
                value="notes"
                onClick={() => setShowTranscriptButton(false)}
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                onClick={() => setShowTranscriptButton(false)}
              >
                Reports
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSessionChatOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:opacity-95 focus:opacity-90"
              >
                Chat with session
              </Button>
            </div>
            {showTranscriptButton && (
              <div className="flex items-center justify-end gap-3 ml-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setTranscriptOpen((v) => !v)}
                    className="px-2"
                  >
                    {transcriptOpen ? "Hide Transcript" : "Show Transcript"}
                  </Button>
                  <AddNoteDialog currentTime={currentTime} />
                </div>
              </div>
            )}
          </div>

          <TabsContent value="session" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Video - make larger on large screens */}
              <div className="space-y-6 lg:col-span-6 flex flex-col">
                <div className="flex-1 min-h-[420px] lg:min-h-[560px] rounded-2xl overflow-hidden">
                  <VideoPlayer
                    url={videoUrl}
                    markers={dummyTimelineMarkers}
                    onProgress={(progress) =>
                      setCurrentTime(progress.playedSeconds)
                    }
                    seekRef={seekRef}
                  />
                </div>
              </div>

              {/* Transcript column - collapsible */}
              {transcriptOpen ? (
                <div className="space-y-6 lg:col-span-3 flex flex-col">
                  <div className="flex-1 min-h-[420px] rounded-2xl overflow-hidden">
                    <TranscriptPanel
                      transcripts={dummyTranscripts}
                      currentTime={currentTime}
                      onSeek={(t) => seekRef.current?.(t)}
                      onAddToNotes={(content, timestamp) =>
                        addNote({ content, tags: [], timestamp_ref: timestamp })
                      }
                    />
                  </div>
                </div>
              ) : null}

              {/* AI notes / analysis column - expands to remaining space when transcript hidden */}
              <div
                className={`space-y-6 ${
                  transcriptOpen ? "lg:col-span-3" : "lg:col-span-6"
                } flex flex-col`}
              >
                <div className="flex-1 min-h-[420px] rounded-2xl overflow-hidden">
                  <AINotesPanel
                    notes={dummyNotes}
                    insights={dummyInsights?.map((i: any) => ({
                      theme: i.theme,
                      detailed_analysis: i.detailed_analysis,
                    }))}
                    onAddToNotes={(content) =>
                      addNote({ content, tags: [], timestamp_ref: currentTime })
                    }
                  />
                </div>
              </div>
            </div>
            <TagsFilter
              tags={filterTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />

            <SentimentTimeline data={dummySentimentData} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Session Notes
              </h3>
              <RichTextEditor
                content={notes}
                onChange={setNotes}
                placeholder="Add your observations and insights..."
              />
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <ThemesCloud themes={dummyThemes} />
            <SummaryCharts
              sentimentSplit={dummySummaryData.sentimentSplit}
              topEmotions={dummySummaryData.topEmotions}
              productMentions={dummySummaryData.productMentions}
            />
          </TabsContent>

          <TabsContent value="ai_overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    AI Researcher Overview
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    A generated report summarizing key themes, quotes, and
                    recommendations from this session.
                  </p>
                  <div className="prose max-w-full dark:prose-invert">
                    <p>
                      <strong>Top themes:</strong>{" "}
                      {dummyThemes
                        .slice(0, 5)
                        .map((t) => t.theme_name)
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Highlights:</strong>
                    </p>
                    <ul>
                      {(dummyInsights || [])
                        .slice(0, 6)
                        .map((i: any, idx: number) => (
                          <li key={idx}>
                            {i.detailed_analysis
                              ? i.detailed_analysis.slice(0, 200)
                              : i.insights?.[0]?.summary || i.theme}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Quick actions
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setOverviewChatOpen(true);
                      }}
                      className="w-full"
                    >
                      Open Overview Chat
                    </Button>
                    <Button variant="outline" className="w-full">
                      Copy Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            <Quotes sessionId={resolvedParams.sessionId} />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <NotesPanel />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Reports & Summaries
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate and edit AI-powered reports from your session
                  </p>
                </div>
                <Button
                  onClick={() => setReportModalOpen(true)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            <ExecutiveSummaryEditor />
          </TabsContent>
        </Tabs>
      </div>

      <GenerateReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
      {/* global selection helper to add selected text anywhere on the page to notes */}
      <SelectionAddToNotes
        onAdd={(content) =>
          addNote({ content, tags: [], timestamp_ref: currentTime })
        }
      />
      <SessionChatDrawer
        open={sessionChatOpen}
        onOpenChange={setSessionChatOpen}
        projectId={resolvedParams.id}
        sessionId={resolvedParams.sessionId}
      />

      <SessionChatDrawer
        open={overviewChatOpen}
        onOpenChange={setOverviewChatOpen}
        projectId={resolvedParams.id}
        sessionId={resolvedParams.sessionId}
        initialAssistantText={overviewAssistantText}
      />
    </MainLayout>
  );
}
