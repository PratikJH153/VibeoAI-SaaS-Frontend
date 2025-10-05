"use client";

import React, { useState } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
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
    <MainLayout>
      <div className="max-w-[1400px] mx-auto">
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
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}`}>
              <Button variant="ghost">Project Settings</Button>
            </Link>
            <Button
              variant="gradient"
              onClick={() => setChatOpen(true)}
              className="px-5"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with project
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Session
            </Button>
          </div>
        </div>

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
