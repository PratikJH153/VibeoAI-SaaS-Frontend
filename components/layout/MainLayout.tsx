"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useStore } from "@/lib/store";

interface MainLayoutProps {
  children: React.ReactNode;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  showTopNavBar?: boolean;
}

export function MainLayout({
  children,
  onCreateNew,
  createButtonLabel,
  showTopNavBar = true,
}: MainLayoutProps) {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <TopNav
        onCreateNew={onCreateNew}
        createButtonLabel={createButtonLabel}
        showTopNavBar={showTopNavBar}
      />

      <motion.main
        initial={false}
        animate={{ paddingLeft: sidebarCollapsed ? 96 : 272 }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">{children}</div>
      </motion.main>
    </div>
  );
}
