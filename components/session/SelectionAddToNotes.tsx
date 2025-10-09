"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onAdd: (content: string) => void;
}

export function SelectionAddToNotes({ onAdd }: Props) {
  const [visible, setVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const ignoreSelectionRef = useRef(false);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      // If the dialog or its inputs are being interacted with, ignore selection changes
      if (ignoreSelectionRef.current) return;
      if (!sel) return setVisible(false);
      const s = sel.toString().trim();
      if (!s) {
        setButtonVisible(false);
        return setVisible(false);
      }

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Position near the selection (to the right). Clamp to viewport so the small
        // hover button doesn't appear off-screen.
        const margin = 8;
        const btnApproxWidth = 60; // approximate button width to avoid overflow
        let left = rect.right + window.scrollX;
        let top = rect.top + window.scrollY - 10;
        const maxLeft =
          window.innerWidth - btnApproxWidth - margin + window.scrollX;
        if (left > maxLeft)
          left = Math.max(
            margin + window.scrollX,
            rect.left + window.scrollX - btnApproxWidth
          );
        if (left < margin + window.scrollX) left = margin + window.scrollX;
        if (top < margin) top = margin + window.scrollY;

        setCoords({ x: left, y: top });
        setText(s);
        // show the small hover button by default; dialog opens on button click
        setButtonVisible(true);
        setVisible(false);
      } catch (e) {
        // ignore invalid ranges
        setVisible(false);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // if click is outside the dialog and outside the button, hide both
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) {
        // clicking inside the dialog should not hide it
        return;
      }
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      setVisible(false);
      setButtonVisible(false);
    };

    const onScroll = () => setVisible(false);

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // When the dialog becomes visible, ensure it fits in the viewport by measuring
  // its rendered size and adjusting coords if needed.
  useLayoutEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;

    let newLeft = coords.x;
    let newTop = coords.y;

    // If dialog overflows to the right, shift it left
    if (rect.right > window.innerWidth - margin) {
      newLeft =
        Math.max(margin, window.innerWidth - rect.width - margin) +
        window.scrollX;
    }

    // If dialog overflows bottom, try to position above the selection
    if (rect.bottom > window.innerHeight - margin) {
      // place above
      newTop = Math.max(margin, coords.y - rect.height - 16);
    }

    // Ensure not off the left/top edges
    if (newLeft < margin) newLeft = margin;
    if (newTop < margin) newTop = margin;

    // Only update if changed to avoid reflows
    if (newLeft !== coords.x || newTop !== coords.y) {
      setCoords({ x: newLeft, y: newTop });
    }
  }, [visible]);

  return (
    <>
      {/* small hover button shown near selection */}
      {buttonVisible && (
        <div
          style={{
            position: "absolute",
            left: coords.x,
            top: coords.y,
            zIndex: 60,
          }}
        >
          <button
            ref={buttonRef}
            onClick={() => {
              setVisible(true);
              setButtonVisible(false);
            }}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              padding: "6px 8px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Add
          </button>
        </div>
      )}

      {visible && (
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            left: coords.x,
            top: coords.y,
            zIndex: 60,
            width: 320,
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            background: "white",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div style={{ maxHeight: 80, overflow: "auto", marginBottom: 8 }}>
            <strong style={{ display: "block", marginBottom: 6 }}>
              Selected
            </strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
              Add a note
            </label>
            <Textarea
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              rows={3}
              placeholder="Write a note about this selection..."
              onFocus={() => {
                ignoreSelectionRef.current = true;
              }}
              onBlur={() => {
                // small timeout to allow clicks on the buttons to be handled first
                setTimeout(() => {
                  ignoreSelectionRef.current = false;
                }, 100);
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVisible(false);
                setNote("");
                window.getSelection()?.removeAllRanges();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const combined = note ? `${text}\n\n${note}` : text;
                onAdd(combined);
                setVisible(false);
                setNote("");
                window.getSelection()?.removeAllRanges();
              }}
            >
              Add note
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
