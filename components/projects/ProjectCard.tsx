'use client';

import { motion } from 'framer-motion';
import { Video, Calendar, MoveVertical as MoreVertical, Play, Plus, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  name: string;
  client_name?: string;
  description?: string;
  project_type: string;
  sessions_count: number;
  created_at: string;
}

export function ProjectCard({
  id,
  name,
  client_name,
  description,
  project_type,
  sessions_count,
  created_at,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                {name}
              </h3>
              {client_name && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {client_name}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">
            {project_type}
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-4 h-4" />
            {sessions_count} sessions
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link href={`/projects/${id}`} className="flex-1">
            <Button variant="default" className="w-full gap-2">
              <Play className="w-4 h-4" />
              Open Project
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
