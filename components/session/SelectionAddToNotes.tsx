"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onAdd: (content: string) => void;
}

export function SelectionAddToNotes({ onAdd }: Props) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [text, setText] = useState("");

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel) return setVisible(false);
      const s = sel.toString().trim();
      if (!s) return setVisible(false);

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setCoords({
        x: rect.right + window.scrollX,
        y: rect.top + window.scrollY - 10,
      });
      setText(s);
      setVisible(true);
    };

    document.addEventListener("selectionchange", handler);
    document.addEventListener("mousedown", () => setVisible(false));
    window.addEventListener("scroll", () => setVisible(false));

    return () => {
      document.removeEventListener("selectionchange", handler);
      document.removeEventListener("mousedown", () => setVisible(false));
      window.removeEventListener("scroll", () => setVisible(false));
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: coords.x,
        top: coords.y,
        zIndex: 60,
      }}
    >
      <Button
        size="sm"
        onClick={() => {
          onAdd(text);
          window.getSelection()?.removeAllRanges();
        }}
      >
        Add to notes
      </Button>
    </div>
  );
}
