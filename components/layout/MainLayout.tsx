"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useStore } from "@/lib/store";
import { getAmbientRGBA } from "@/lib/theme-colors";

interface MainLayoutProps {
  children: React.ReactNode;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  askAnythingButtonLabel?: string;
  onAskAnything?: () => void;
  showTopNavBar?: boolean;
  // optional theme name to drive ambient background
  ambientTheme?: string | null;
  showAmbient?: boolean;
}

export function MainLayout({
  children,
  onCreateNew,
  createButtonLabel,
  onAskAnything,
  askAnythingButtonLabel,
  showTopNavBar = true,
  ambientTheme = null,
  showAmbient = false,
}: MainLayoutProps) {
  const { sidebarCollapsed } = useStore();

  // compute ambient color with a subtle alpha
  const ambientColor = getAmbientRGBA(ambientTheme, 0.14);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Ambient radial gradient centered on the page (behind everything) */}
      {/* {showAmbient && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <div
            style={{
              width: "100vmax",
              height: "100vmax",
              background: `radial-gradient(circle at center, ${ambientColor} 0%, rgba(0,0,0,0) 80%)`,
              filter: "blur(72px)",
              transform: "translateZ(0)",
              opacity: 0.95,
              borderRadius: "50%",
            }}
          />
        </div>
      )} */}

      {/* Put main chrome into a higher stacking context so it sits above the ambient */}
      <div className="relative z-10">
        <Sidebar />
        <TopNav
          onCreateNew={onCreateNew}
          createButtonLabel={createButtonLabel}
          showTopNavBar={showTopNavBar}
          onAskAnything={onAskAnything}
          askAnythingButtonLabel={askAnythingButtonLabel}
        />

        <motion.main
          initial={false}
          animate={{ paddingLeft: sidebarCollapsed ? 96 : 272 }}
          className={showTopNavBar ? "pt-16 min-h-screen" : "pt-4 min-h-screen"}
        >
          <div className="p-6">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}
