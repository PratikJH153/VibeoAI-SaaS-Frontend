"use client";

import { motion } from "framer-motion";
import { getColorForTheme } from "@/lib/theme-colors";

interface Theme {
  theme_name: string;
  mentions_count: number;
  relevance_score: number;
}

interface ThemesCloudProps {
  themes: Theme[];
  onSelect?: (themeName: string) => void;
}

export function ThemesCloud({ themes, onSelect }: ThemesCloudProps) {
  const maxMentions = Math.max(...themes.map((t) => t.mentions_count));
  const minMentions = Math.min(...themes.map((t) => t.mentions_count));

  const getFontSize = (mentions: number) => {
    const normalized = (mentions - minMentions) / (maxMentions - minMentions);
    return 14 + normalized * 28;
  };

  const getOpacity = (relevance: number) => {
    return 0.5 + relevance * 0.5;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Key Themes
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Most discussed topics throughout the session
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 py-8 min-h-[200px]">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.theme_name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: getOpacity(theme.relevance_score), scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            className="cursor-pointer"
          >
            <button
              onClick={() => onSelect?.(theme.theme_name)}
              className="font-semibold transition-colors text-left"
              style={{
                fontSize: `${getFontSize(theme.mentions_count)}px`,
                color: getColorForTheme(theme.theme_name),
              }}
            >
              {theme.theme_name}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              ({theme.mentions_count})
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Less mentioned
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Most mentioned
          </span>
        </div>
      </div>
    </motion.div>
  );
}
