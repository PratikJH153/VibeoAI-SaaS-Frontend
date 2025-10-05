"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Import example session data from the local data/ folder so the summary can show
// additional conversation-level blocks (speaking time, attention, top themes).
// These JSON imports are intentionally static for the demo dataset that lives
// in the repository's `data/` folder.
import enrichedTranscripts from "../../data/enriched_transcripts_95b5d907-0d2.json";
import insightsTranscriptions from "../../data/insights_transcriptions_95b5d907-0d2.json";

interface SummaryChartsProps {
  sentimentSplit: Array<{ name: string; value: number; color: string }>;
  topEmotions: Array<{ emotion: string; count: number }>;
  productMentions: Record<string, number>;
}

export function SummaryCharts({
  sentimentSplit,
  topEmotions,
  productMentions,
}: SummaryChartsProps) {
  const productMentionsData = Object.entries(productMentions).map(
    ([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      mentions: count,
    })
  );

  const totalSentiment = sentimentSplit.reduce(
    (acc, item) => acc + item.value,
    0
  );

  // --- Conversation-level aggregates computed from the demo data files ---
  const segments = (enrichedTranscripts as any) || [];

  // speaking time per participant
  const speakingTimeMap: Record<string, number> = {};
  let totalDuration = 0;
  let attentionCount = 0;
  segments.forEach((s: any) => {
    const dur = Math.max(0, (s.end_time || 0) - (s.start_time || 0));
    totalDuration += dur;
    if (!speakingTimeMap[s.speaker]) speakingTimeMap[s.speaker] = 0;
    speakingTimeMap[s.speaker] += dur;
    if (s.attention_marker === "yes") attentionCount += 1;
  });

  const speakingByParticipant = Object.entries(speakingTimeMap).map(
    ([speaker, seconds]) => ({
      name: speaker,
      seconds: Number(seconds.toFixed(2)),
    })
  );

  const attentionPercent = segments.length
    ? Math.round((attentionCount / segments.length) * 100)
    : 0;

  const insights = (insightsTranscriptions as any) || [];
  const topThemes = insights
    .slice(0, 5)
    .map((t: any) => ({
      theme: t.theme,
      summary: t.detailed_analysis || "",
      keyInsights: (t.insights || []).length,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Sentiment Distribution
        </h3>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {sentimentSplit.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {Math.round((item.value / totalSentiment) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Speaking Time by Participant
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={speakingByParticipant}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            <Bar dataKey="seconds" fill="#16a34a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-3 text-sm text-muted">
          Total conversation length: {totalDuration.toFixed(1)}s · Attention
          segments: {attentionPercent}%
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Top Emotions Detected
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topEmotions} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.5}
            />
            <XAxis
              type="number"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              dataKey="emotion"
              type="category"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px",
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Product Mentions
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={productMentionsData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "12px",
              }}
            />
            <Bar dataKey="mentions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Positive
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {sentimentSplit.find((s) => s.name === "Positive")?.value || 0}%
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Negative
              </span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {sentimentSplit.find((s) => s.name === "Negative")?.value || 0}%
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Neutral
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {sentimentSplit.find((s) => s.name === "Neutral")?.value || 0}%
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Mentions
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {Object.values(productMentions).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
