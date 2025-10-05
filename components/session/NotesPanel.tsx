"use client";

import React, { useState } from "react";
import { useNotesStore, Note } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2 } from "lucide-react";

export function NotesPanel() {
  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setDraft(n.content);
  };

  const saveEdit = (id: string) => {
    updateNote(id, { content: draft });
    setEditingId(null);
    setDraft("");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-transparent p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Notes
        </h3>
        <Button
          onClick={() =>
            addNote({ content: "", tags: [], timestamp_ref: null })
          }
          size="sm"
        >
          Add Note
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {editingId === n.id ? (
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft((e as any).target.value)}
                      className="mb-2"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {n.content || <em className="text-slate-400">(empty)</em>}
                    </p>
                  )}

                  <div className="mt-2 text-xs text-slate-500">
                    {n.timestamp_ref != null && (
                      <span className="mr-3">
                        Time: {Math.floor(n.timestamp_ref / 60)}:
                        {String(Math.floor(n.timestamp_ref % 60)).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    )}
                    {n.tags && n.tags.length > 0 && (
                      <span>Tags: {n.tags.join(", ")}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {editingId === n.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(n.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(n)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteNote(n.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-sm text-slate-500">
              No notes yet. Select text or click 'Add Note' to create one.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
