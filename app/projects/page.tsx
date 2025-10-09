"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { dummyProjects } from "@/lib/dummy-data";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Project() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // client-side navigate to sign-in to avoid full-page flash
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    // show a simple loading placeholder while Clerk resolves
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      onCreateNew={() => setCreateModalOpen(true)}
      createButtonLabel="New Project"
    >
      <div className="max-w-1xl m-2 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and analyze your video research projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </div>
      </div>

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </MainLayout>
  );
}
