"use client";

import React, { useState } from "react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkle, Sparkles } from "lucide-react";
import { dummyProjects, dummySessions } from "@/lib/dummy-data";
import { SessionCard } from "@/components/projects/SessionCard";
import { CreateSessionModal } from "@/components/projects/CreateSessionModal";
import { ProjectChatDrawer } from "@/components/projects/ProjectChatDrawer";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const resolvedParams = (React as any).use
    ? (React as any).use(params as any)
    : params;
  const id = resolvedParams?.id;
  const project = dummyProjects.find((p) => p.id === id) ?? dummyProjects[0];
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // sessions belonging to this project
  const sessions = dummySessions.filter(
    (s) => String(s.project_id) === String(project.id)
  );

  return (
    <MainLayout
      askAnythingButtonLabel="Ask Anything"
      onAskAnything={() => setChatOpen(true)}
      onCreateNew={() => setCreateModalOpen(true)}
      createButtonLabel="New Session"
    >
      <div className="max-w-1xl m-2 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {project.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {project.description}
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-500">
            <span className="mr-4">{project.sessions_count} sessions</span>
          </div>
        </div>

        {sessions.length > 1 && <ProminentProgressBanner />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              id={s.id}
              title={s.title}
              duration={s.duration}
              status={s.status}
              created_at={s.created_at}
              projectId={project.id}
              thumbnailUrl={s.thumbnail}
            />
          ))}
        </div>
      </div>

      <CreateSessionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        projectId={project.id}
      />
      <ProjectChatDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
        projectId={project.id}
      />
    </MainLayout>
  );
}

function ProminentProgressBanner() {
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const steps = [
    "Initializing session",
    "Uploading media",
    "Processing video",
    "Analyzing audio",
    "Finalizing",
  ];

  React.useEffect(() => {
    const totalMs = 10000; // total 10s
    const stepMs = totalMs / steps.length;
    const start = Date.now();

    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      const idx = Math.min(steps.length - 1, Math.floor(elapsed / stepMs));
      setCurrentStep(idx);
      if (pct < 100) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-6">
      <div className="rounded-lg p-4 bg-gradient-to-r  text-black shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Session processing</h3>
            <p className="text-sm opacity-90 mt-1">
              Live processing for newly created sessions
            </p>
          </div>
          <div className="text-sm font-mono text-white/90">
            {Math.round(progress)}%
          </div>
        </div>

        <div className="mt-4">
          <div className="h-3 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className="h-3 bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.12 }}
            />
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {steps.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{
                  opacity: i === currentStep ? 1 : 0.7,
                  scale: i === currentStep ? 1.02 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`text-xs px-2 py-1 rounded-full ${
                  i === currentStep
                    ? "bg-white/90 text-indigo-700 font-semibold"
                    : "bg-white/20 text-black/70 dark:text-white/70"
                }`}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
