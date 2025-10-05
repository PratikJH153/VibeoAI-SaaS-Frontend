"use client";

import { formatTime } from "@/utils/format_time";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SentimentDataPoint {
  timestamp: number;
  sentiment_score: number;
  sentiment_label: string;
  emotion: string;
}

interface SentimentTimelineProps {
  data: SentimentDataPoint[];
}

export function SentimentTimeline({ data }: SentimentTimelineProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {formatTime(data.timestamp)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Score:{" "}
            <span className="font-semibold">
              {data.sentiment_score.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Sentiment:{" "}
            <span className="font-semibold capitalize">
              {data.sentiment_label}
            </span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Emotion:{" "}
            <span className="font-semibold capitalize">{data.emotion}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getLineColor = (score: number) => {
    if (score > 0.3) return "#10b981";
    if (score < -0.3) return "#ef4444";
    return "#6b7280";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Sentiment Timeline
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Track emotional sentiment throughout the session
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.5}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              domain={[-1, 1]}
              stroke="#64748b"
              style={{ fontSize: "12px" }}
              ticks={[-1, -0.5, 0, 0.5, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="sentiment_score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                // Prefer a stable unique key from the data (timestamp), fall back to index
                const key = payload?.timestamp ?? index ?? `${cx}-${cy}`;
                return (
                  <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={getLineColor(payload.sentiment_score)}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Positive (0.3+)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Neutral (-0.3 to 0.3)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Negative (-0.3-)
          </span>
        </div>
      </div>
    </motion.div>
  );
}
