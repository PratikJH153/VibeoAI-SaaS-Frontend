import "react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Sparkles } from "lucide-react";

interface InsightCardSectionProps {
  dummyInsights: any[];
  setActiveInsight: (insight: any) => void;
  setInsightDialogOpen: (open: boolean) => void;
  insightDialogOpen: boolean;
  activeInsight: any;
  addNoteButtonClick: () => void;
}

export default function InsightsCardSection({
  dummyInsights = [],
  setActiveInsight = () => {},
  setInsightDialogOpen = () => {},
  insightDialogOpen = false,
  activeInsight = null,
  addNoteButtonClick = () => {},
}: InsightCardSectionProps) {
  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-bg h-full overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 " />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Deep AI Insights
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 ">
            Automatically generated insights cards
          </p>
        </div>

        <ScrollArea className="h-full">
          {/* Grid container: allow vertical scrolling if many cards; ensure it fills available height */}
          <div className="p-2 flex-1 mr-2 overflow-auto h-full">
            <div
              role="list"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4"
            >
              {dummyInsights.map((insight: any, idx: number) => {
                const id = insight?.theme || `insight-${idx}`;
                const short =
                  insight?.detailed_analysis?.slice(0, 110) ||
                  insight?.insights?.[0]?.summary?.slice(0, 110) ||
                  "Short insight summary...";

                const chips: {
                  label: string;
                  color: "green" | "red" | "gray";
                }[] = [];
                if (insight?.sentiment === "positive")
                  chips.push({ label: "Positive", color: "green" });
                if (insight?.sentiment === "negative")
                  chips.push({ label: "Negative", color: "red" });
                if ((insight?.tags || []).length > 0) {
                  (insight.tags || [])
                    .slice(0, 2)
                    .forEach((t: string) =>
                      chips.push({ label: String(t), color: "gray" })
                    );
                }

                return (
                  <article
                    key={id}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => {
                      setActiveInsight(insight);
                      setInsightDialogOpen(true);
                    }}
                    className="cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transform transition-transform duration-200 ease-out hover:scale-105 focus:scale-105"
                    aria-label={`Insight ${idx + 1}`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {insight?.theme || `Insight ${idx + 1}`}
                      </h4>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                      {short}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      {chips.length > 0 ? (
                        chips.map((c, i) => (
                          <span
                            key={i}
                            className={
                              `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ` +
                              (c.color === "green"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.color === "red"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200")
                            }
                          >
                            {c.label}
                          </span>
                        ))
                      ) : (
                        <Badge variant="outline">Insight</Badge>
                      )}

                      <div className="ml-auto flex gap-2">
                        {(insight?.positives || ["likes"])
                          .slice(0, 1)
                          .map((p: string, i: number) => (
                            <span
                              key={`pos-${i}`}
                              className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                            >
                              {p}
                            </span>
                          ))}
                        {(insight?.negatives || ["pricing"])
                          .slice(0, 1)
                          .map((n: string, i: number) => (
                            <span
                              key={`neg-${i}`}
                              className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800"
                            >
                              {n}
                            </span>
                          ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Insight detail dialog */}
      <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {activeInsight?.theme || "Insight detail"}
            </DialogTitle>
            <DialogDescription>
              {activeInsight?.insights?.[0]?.summary?.slice(0, 140) ||
                activeInsight?.detailed_analysis?.slice(0, 140) ||
                "Summary..."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto pr-2 pb-24 max-h-[calc(80vh-200px)]">
              <h4 className="text-sm font-semibold mb-2">Context</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {(activeInsight?.tags || []).map((t: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-800"
                  >
                    {t}
                  </span>
                ))}
                {activeInsight?.sentiment === "positive" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                    Positive
                  </span>
                )}
                {activeInsight?.sentiment === "negative" && (
                  <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
                    Negative
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300">
                {activeInsight?.detailed_analysis ||
                  "No further analysis available."}
              </div>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => addNoteButtonClick()}>
              Save to notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
