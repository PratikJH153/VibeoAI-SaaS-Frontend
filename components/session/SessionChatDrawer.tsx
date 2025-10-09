"use client";

import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, Send } from "lucide-react";
import { dummyProjects, dummySessions } from "@/lib/dummy-data";

interface Message {
  id: string;
  from: "user" | "assistant";
  text: string;
  ts?: number;
}

export function SessionChatDrawer({
  open,
  onOpenChange,
  projectId,
  sessionId,
  initialAssistantText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
  sessionId: string | number;
  initialAssistantText?: string;
}) {
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      from: "assistant",
      text:
        initialAssistantText ||
        `Hi — I'm your session assistant for session ${sessionId}. Ask me about this session's transcript, notes, or insights.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const project = dummyProjects.find((p) => String(p.id) === String(projectId));
  const session = dummySessions.find((s) => String(s.id) === String(sessionId));

  useEffect(() => {
    listRef.current?.scrollTo({ top: 99999 });
  }, [messages, open]);

  const toggleListening = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);

    // simulate listening for ~2.5s then add a user message
    setTimeout(() => {
      const now = Date.now();
      const userMsg: Message = {
        id: String(now),
        from: "user",
        text: "Voice input (simulated)",
        ts: now,
      };
      setMessages((m) => [...m, userMsg]);
      setListening(false);

      // trigger assistant reply
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const reply: Message = {
          id: String(Date.now() + 1),
          from: "assistant",
          text: `I heard your voice input (simulated). You said: "${userMsg.text}"`,
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, reply]);
      }, 800 + Math.random() * 800);
    }, 2500);
  };

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
      const reply: Message = {
        id: String(Date.now() + 1),
        from: "assistant",
        text: `I looked at session ${sessionId} in project ${projectId}. Quick summary: (simulated) — You asked: "${userMsg.text}"`,
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full right-0 top-0 bottom-0 fixed z-50">
        <div className="flex h-screen">
          {/* Single-column chat area (no left context panel) */}
          <div className="flex-1 flex flex-col">
            <DrawerHeader>
              <div className="flex items-start justify-between w-full gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5" />
                    <DrawerTitle>Session Assistant</DrawerTitle>
                  </div>
                  <DrawerDescription>
                    Chat about session{" "}
                    <strong>{session?.title ?? sessionId}</strong> in project{" "}
                    <strong>{project?.name ?? projectId}</strong>.
                  </DrawerDescription>
                </div>

                {/* top-right close (X) button */}
                <div className="ml-4 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close chat"
                    className="p-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                    >
                      <path
                        fill="currentColor"
                        d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
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

            <DrawerFooter className="pb-8 pt-4">
              <div className="w-full">
                <div className="mx-auto w-full max-w-3xl px-4">
                  <div className="flex items-center gap-3">
                    <Input
                      value={input}
                      onKeyDown={onKeyDown}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask something about this session... (Enter to send)"
                      className="flex-1 rounded-full px-5 py-6 text-md"
                    />

                    <Button
                      onClick={send}
                      className="rounded-full px-5 py-4 h-12 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>

                    {/* voice (mic) button in footer */}
                    <Button
                      variant={listening ? "default" : "ghost"}
                      onClick={toggleListening}
                      aria-label={
                        listening ? "Stop listening" : "Start voice input"
                      }
                      className={`rounded-full px-4 py-3 h-12 ${
                        listening ? "bg-red-600 text-white" : ""
                      }`}
                    >
                      <Mic
                        className={`w-5 h-5 ${
                          listening ? "animate-pulse" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
