"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Suggestion {
  id: string;
  original: string;
  suggested: string;
  reason: string;
}

interface ExecutiveSummaryEditorProps {
  initialContent?: string;
}

export function ExecutiveSummaryEditor({
  initialContent = "",
}: ExecutiveSummaryEditorProps) {
  const [content, setContent] = useState(
    initialContent ||
      `Based on our analysis of the user interview with Sarah, a Product Manager with 5 years of experience, we've identified several critical pain points in her current workflow.

The primary issue centers around context switching between multiple project management tools (Jira and Notion), resulting in significant productivity loss estimated at 30-45 minutes daily. This represents approximately 3-4 hours per week of pure administrative overhead.

Key findings include:
• Lack of synchronization between tools creates information silos
• Team visibility is compromised, requiring manual status updates
• Decision-making is delayed due to scattered information
• User frustration is evident, particularly during peak project phases

The emotional journey tracked throughout the interview revealed predominantly negative sentiment (45%) when discussing current tool limitations, with brief positive spikes (30%) when imagining ideal solutions.

Recommendation: Prioritize development of a unified workspace that eliminates context switching while maintaining the flexibility users appreciate in their current tool stack.`
  );

  const [suggestions] = useState<Suggestion[]>([
    {
      id: "1",
      original: "we've identified several critical pain points",
      suggested: "we discovered three major pain points",
      reason: "More specific and concrete",
    },
    {
      id: "2",
      original: "resulting in significant productivity loss",
      suggested: "causing a 10-15% reduction in daily productivity",
      reason: "Quantified impact is more compelling",
    },
  ]);

  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<string[]>([]);

  const handleAccept = (suggestion: Suggestion) => {
    setContent(content.replace(suggestion.original, suggestion.suggested));
    setAcceptedSuggestions([...acceptedSuggestions, suggestion.id]);
  };

  const handleReject = (suggestionId: string) => {
    setRejectedSuggestions([...rejectedSuggestions, suggestionId]);
  };

  const handleRegenerate = () => {
    console.log("Regenerating suggestions...");
  };

  const activeSuggestions = suggestions.filter(
    (s) =>
      !acceptedSuggestions.includes(s.id) && !rejectedSuggestions.includes(s.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Executive Summary
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-generated summary with inline editing capabilities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {content}
          {/* <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-serif text-base leading-relaxed resize-none"
          /> */}
        </div>
      </div>

      {/* <AnimatePresence>
        {activeSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  AI Suggestions
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {activeSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Current:
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-through">
                        {suggestion.original}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Suggested:
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">
                        {suggestion.suggested}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3 h-3" />
                      <span>{suggestion.reason}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAccept(suggestion)}
                        size="sm"
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(suggestion.id)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {acceptedSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <Check className="w-4 h-4" />
          <span>{acceptedSuggestions.length} suggestion(s) applied</span>
        </motion.div>
      )}
    </motion.div>
  );
}
