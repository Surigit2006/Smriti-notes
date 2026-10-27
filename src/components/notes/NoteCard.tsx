"use client";

import type React from "react";
import { useRef } from "react";
import { MoreHorizontal } from "lucide-react";

import type { LocalNote } from "@/database/dexie";

interface NoteCardProps {
  note: LocalNote;
  selected: boolean;
  onClick: () => void;
  onContextMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    note: LocalNote,
  ) => void;
}

const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE = 10;

/** The menu only needs the coordinates, so a lightweight stand-in event works. */
function menuEvent(x: number, y: number) {
  return {
    clientX: x,
    clientY: y,
    preventDefault() {},
    stopPropagation() {},
  } as unknown as React.MouseEvent<HTMLButtonElement>;
}

export default function NoteCard({
  note,
  selected,
  onClick,
  onContextMenu,
}: NoteCardProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const longPressed = useRef(false);

  function cancelPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <div className="group relative">
      {/*
        A div (not a <button>) on purpose: Firefox will not start a drag
        from inside a <button>, which breaks drag-and-drop into collections.
      */}
      <div
        role="button"
        tabIndex={0}
        onClick={(event) => {
          // A long press ends with a click: swallow it so the menu stays open
          if (longPressed.current) {
            longPressed.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          onClick();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          const x = touch.clientX;
          const y = touch.clientY;

          pressStart.current = { x, y };
          longPressed.current = false;
          cancelPress();

          pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            onContextMenu(menuEvent(x, y), note);
          }, LONG_PRESS_MS);
        }}
        onTouchMove={(event) => {
          const start = pressStart.current;
          if (!start) return;

          const touch = event.touches[0];
          if (
            Math.hypot(touch.clientX - start.x, touch.clientY - start.y) >
            MOVE_TOLERANCE
          ) {
            cancelPress();
          }
        }}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        onContextMenu={(event) =>
          onContextMenu(
            event as unknown as React.MouseEvent<HTMLButtonElement>,
            note,
          )
        }
        aria-current={selected ? "true" : undefined}
        className={[
          "w-full cursor-pointer select-none rounded-lg px-2.5 py-2.5 pr-9 text-left [-webkit-touch-callout:none] md:py-1.5 md:pr-8",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          selected
            ? "bg-[var(--active)] text-[var(--foreground)]"
            : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]",
        ].join(" ")}
      >
        <span
          className={`block truncate text-[13px] leading-5 ${
            selected ? "font-medium" : "font-normal"
          }`}
        >
          {note.title?.trim() || "Untitled Note"}
        </span>
      </div>

      {/* Three dots: opens the same menu as right-click */}
      <button
        type="button"
        title="More options"
        aria-label={`Options for ${note.title?.trim() || "Untitled Note"}`}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onContextMenu(event, note);
        }}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--muted)] opacity-0 transition-opacity hover:bg-[var(--active)] hover:text-[var(--foreground)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] group-hover:opacity-100 md:h-6 md:w-6 [@media(hover:none)]:opacity-100"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}