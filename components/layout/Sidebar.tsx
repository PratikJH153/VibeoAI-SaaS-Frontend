"use client";

import { motion } from "framer-motion";
import {
  Chrome as Home,
  FileText,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChartBar as BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Projects", href: "/" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 256 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6">
          <motion.div
            initial={false}
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
            className="flex items-center gap-2"
          >
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg text-slate-900 dark:text-white">
                Vibeo AI
              </span>
            )}
          </motion.div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5",
              sidebarCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  Demo User
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  demo@example.com
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
