'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, ChartBar as BarChart3, MessageSquare, Download } from 'lucide-react';

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypes = [
  {
    id: 'executive',
    label: 'Executive Summary',
    description: 'High-level overview with key insights and recommendations',
    icon: FileText,
  },
  {
    id: 'insights',
    label: 'Insights Report',
    description: 'Detailed analysis with charts, themes, and sentiment breakdown',
    icon: BarChart3,
  },
  {
    id: 'conversation',
    label: 'Conversation Report',
    description: 'Full transcript with annotations and highlighted moments',
    icon: MessageSquare,
  },
];

const themes = [
  'Context Switching',
  'Tool Integration',
  'Team Visibility',
  'Time Management',
  'Collaboration',
];

export function GenerateReportModal({ open, onOpenChange }: GenerateReportModalProps) {
  const [selectedType, setSelectedType] = useState('executive');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [tone, setTone] = useState('professional');

  const handleGenerate = () => {
    console.log('Generating report:', { selectedType, selectedThemes, tone });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Customize and generate a comprehensive report from your session analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Report Type</Label>
            <div className="grid gap-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedType === type.id
                          ? 'bg-blue-100 dark:bg-blue-900/40'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          selectedType === type.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {type.label}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Include Themes (Optional)</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {themes.map((theme) => (
                <div key={theme} className="flex items-center space-x-2">
                  <Checkbox
                    id={theme}
                    checked={selectedThemes.includes(theme)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedThemes([...selectedThemes, theme]);
                      } else {
                        setSelectedThemes(selectedThemes.filter((t) => t !== theme));
                      }
                    }}
                  />
                  <label
                    htmlFor={theme}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {theme}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Writing Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
