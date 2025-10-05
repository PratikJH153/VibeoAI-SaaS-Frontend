"use client";

import { motion } from "framer-motion";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

interface TopNavProps {
  onCreateNew?: () => void;
  createButtonLabel?: string;
  showTopNavBar?: boolean;
}

export function TopNav({
  onCreateNew,
  createButtonLabel = "New Project",
  showTopNavBar = true,
}: TopNavProps) {
  const { sidebarCollapsed } = useStore();

  return (
    showTopNavBar && (
      <motion.header
        initial={false}
        animate={{ paddingLeft: sidebarCollapsed ? 96 : 272 }}
        className="fixed top-0 right-0 left-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-30"
      >
        <div className="h-full px-6 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search projects, sessions..."
                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </motion.button>

            {onCreateNew && (
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="w-4 h-4" />
                {createButtonLabel}
              </Button>
            )}
          </div>
        </div>
      </motion.header>
    )
  );
}
