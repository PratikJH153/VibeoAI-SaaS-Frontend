"use client";

import { motion } from "framer-motion";
import { Video, Clock, Calendar, PersonStanding } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SessionCardProps {
  id: string;
  title: string;
  duration?: number;
  status?: string;
  created_at?: string;
  projectId: string;
  thumbnailUrl?: string;
}

export function SessionCard({
  id,
  title,
  duration,
  status,
  created_at,
  projectId,
  thumbnailUrl,
}: SessionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <Card className="p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="relative w-full">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${title} thumbnail`}
              className="w-full h-40 sm:h-48 object-cover"
            />
          ) : (
            <div className="w-full h-40 sm:h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
          )}

          {/* gradient overlay and title */}
          <div className="absolute left-0 bottom-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent text-white flex items-end p-3"></div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 py-1">
                <span className="inline-flex items-center gap-2 mr-3">
                  <Calendar className="w-4 h-4" />{" "}
                  {created_at
                    ? new Date(created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </span>
                <span className="inline-flex items-center gap-2 mr-3">
                  <Video className="w-4 h-4" />{" "}
                  {duration ? `${Math.round(duration / 60)}m` : "-"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <PersonStanding className="w-4 h-4" /> {5} Participants
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/projects/${projectId}/sessions/${id}`}>
                <Button variant="default" size="sm">
                  Open
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
