"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotesStore } from "@/lib/store";

interface Props {
  currentTime?: number;
}

export function AddNoteDialog({ currentTime }: Props) {
  const addNote = useNotesStore((s) => s.addNote);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [timestamp, setTimestamp] = useState<number | "">(currentTime ?? "");

  const handleAdd = () => {
    const ts = timestamp === "" ? null : Number(timestamp);
    addNote({ content, tags: [], timestamp_ref: ts ?? null });
    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button className="px-2">Add Note</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            Add a note attached to this session. You can optionally set a
            timestamp to reference the moment in the video.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent((e as any).target.value)}
            placeholder="Write your note here..."
          />
        </div>

        <DialogFooter>
          <Button onClick={handleAdd}>Add note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
