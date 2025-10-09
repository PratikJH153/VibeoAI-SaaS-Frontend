import React from "react";

interface ThematicDeepDiveProps {
  theme: string;
}

export default function ThematicDeepDive({ theme }: ThematicDeepDiveProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {theme}
      </h3>
    </div>
  );
}
