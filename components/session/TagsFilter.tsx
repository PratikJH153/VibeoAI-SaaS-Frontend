'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagsFilterProps {
  tags: Array<{
    id: string;
    label: string;
    color: string;
  }>;
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

export function TagsFilter({ tags, selectedTags, onTagToggle }: TagsFilterProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        Filter by Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <motion.button
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTagToggle(tag.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                isSelected
                  ? 'shadow-md'
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{
                backgroundColor: isSelected ? tag.color : `${tag.color}30`,
                color: isSelected ? 'white' : tag.color,
              }}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {tag.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
