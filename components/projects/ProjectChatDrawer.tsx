"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { dummyProjects, dummySessions } from "@/lib/dummy-data";

interface Message {
  id: string;
  from: "user" | "assistant";
  text: string;
  ts?: number;
}

export function ProjectChatDrawer({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      from: "assistant",
      text: `Hi — I'm your project assistant for project ${projectId}. Ask me anything about this project's sessions, themes, or notes.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // project and sessions must be available before selection state
  const project = dummyProjects.find((p) => String(p.id) === String(projectId));
  const sessions = useMemo(
    () =>
      dummySessions.filter((s) => String(s.project_id) === String(projectId)),
    [projectId]
  );

  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // initialize selection to all sessions when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedSessions(sessions.map((s) => String(s.id)));
    }
  }, [open, sessions]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 99999 });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const now = Date.now();
    const userMsg: Message = {
      id: String(now),
      from: "user",
      text: input.trim(),
      ts: now,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // simulate assistant reply after a short delay
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const selected = sessions.filter((s) =>
        selectedSessions.includes(String(s.id))
      );
      const reply: Message = {
        id: String(Date.now() + 1),
        from: "assistant",
        text: `I looked through ${
          selected.length
        } selected session(s) for project ${projectId}. Quick summary: this project has ${
          Math.floor(Math.random() * 10) + 1
        } sessions. (Simulated reply) — You asked: "${userMsg.text}"`,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 800 + Math.random() * 800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // selection helpers
  const isAllSelected =
    selectedSessions.length === sessions.length && sessions.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map((s) => String(s.id)));
    }
  };

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full right-0 top-0 bottom-0 fixed z-50">
        <div className="flex h-screen">
          {/* Left: project context panel */}
          <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 overflow-auto">
            <div className="flex items-center gap-2 mb-3">
              <div>
                <div className="font-semibold">
                  {project?.name ?? `Project ${projectId}`}
                </div>
                <div className="text-xs text-slate-500">
                  {project?.project_type ?? project?.description}
                </div>
              </div>
            </div>

            {/* <div className="mb-3">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Description
              </div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-3">
                {project?.description}
              </div>
            </div> */}

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Sessions</div>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-slate-500 hover:underline"
                >
                  {isAllSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="space-y-2">
                {sessions.slice(0, 12).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(String(s.id))}
                      onChange={() => toggleSession(String(s.id))}
                      className="w-4 h-4 mt-1"
                    />
                    <Link
                      href={`/projects/${projectId}/sessions/${s.id}`}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <img
                        src={s.thumbnail}
                        className="w-12 h-8 object-cover rounded flex-shrink-0"
                        alt={s.title}
                      />
                      <div className="text-sm line-clamp-2 break-words">
                        {s.title}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: chat area */}
          <div className="flex-1 flex flex-col">
            <DrawerHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <DrawerTitle>Project Assistant</DrawerTitle>
              </div>
              <DrawerDescription>
                Chat with an assistant that knows this project.
              </DrawerDescription>
            </DrawerHeader>

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m, idx) => {
                const prev = messages[idx - 1];
                const isFirstInGroup = !prev || prev.from !== m.from;
                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[85%]">
                      <div className="flex items-end gap-2">
                        {m.from === "assistant" && isFirstInGroup && (
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200">
                            A
                          </div>
                        )}

                        <div
                          className={`${
                            m.from === "user"
                              ? "bg-blue-600 text-white px-3 py-2 rounded-md"
                              : "bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md text-slate-900 dark:text-white"
                          }`}
                        >
                          <div>{m.text}</div>
                          <div className="text-xs text-slate-400 mt-1 text-right">
                            {m.ts ? new Date(m.ts).toLocaleTimeString() : ""}
                          </div>
                        </div>

                        {m.from === "user" && isFirstInGroup && (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            U
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200">
                    A
                  </div>
                  <div className="ml-3 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
                    <div className="h-3 w-12 bg-slate-300 rounded animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            <DrawerFooter>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onKeyDown={onKeyDown}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something about this project... (Enter to send)"
                />
                <Button onClick={send}>Send</Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
