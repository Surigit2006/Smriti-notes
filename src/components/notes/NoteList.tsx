"use client";

import type React from "react";
import { useEffect, useState } from "react";

import type { LocalNote } from "@/database/dexie";
import NoteCard from "./NoteCard";

interface NoteListProps {
  notes: LocalNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: LocalNote) => void;
  onContextMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    note: LocalNote,
  ) => void;

  /** When provided, notes become draggable (drop them on a collection). */
  onMoveNoteToFolder?: (
    noteId: string,
    folderId: string | null,
  ) => Promise<void> | void;

  /** Wrapper classes. Defaults to the original spacing. */
  className?: string;

  /** Text shown when empty. Pass null to render nothing. */
  emptyMessage?: string | null;
}

/** Custom drag type so only notes (not random text) can be dropped on collections. */
export const NOTE_DRAG_TYPE = "application/x-smriti-note";

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onContextMenu,
  onMoveNoteToFolder,
  className,
  emptyMessage,
}: NoteListProps) {
  // Touch screens: HTML drag-and-drop fights long-press, so it is turned off.
  // Notes are moved with the ⋯ menu (Move to collection) instead.
  const [canDrag, setCanDrag] = useState(true);

  useEffect(() => {
    setCanDrag(!window.matchMedia("(hover: none)").matches);
  }, []);

  if (notes.length === 0) {
    if (emptyMessage === null) return null;

    return (
      <div className="px-2.5 py-2">
        <p className="text-xs text-[var(--muted)]">
          {emptyMessage ?? "No notes yet."}
        </p>
      </div>
    );
  }

  return (
    <div className={className ?? "space-y-1 px-2 pb-2"}>
      {notes.map((note) => {
        if (!note) return null;

        return (
          <div
            key={note.id}
            draggable={Boolean(onMoveNoteToFolder) && canDrag}
            onDragStart={(event) => {
              if (!onMoveNoteToFolder) return;

              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(NOTE_DRAG_TYPE, note.id);
              event.dataTransfer.setData("text/plain", note.id);
            }}
            className="active:cursor-grabbing"
          >
            <NoteCard
              note={note}
              selected={selectedNoteId === note.id}
              onClick={() => onSelectNote(note)}
              onContextMenu={onContextMenu}
            />
          </div>
        );
      })}
    </div>
  );
}