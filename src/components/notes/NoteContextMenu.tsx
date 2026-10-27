"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Folder,
  Pin,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type { LocalFolder, LocalNote } from "@/database/dexie";
import { useIsMobile } from "@/hooks/useIsMobile";

interface NoteContextMenuProps {
  note: LocalNote;
  x: number;
  y: number;

  onClose: () => void;

  onTogglePin: (note: LocalNote) => void;
  onArchive: (note: LocalNote) => void;
  onTrash: (note: LocalNote) => void;

  onRestoreFromTrash: (note: LocalNote) => void;
  onDeletePermanently: (note: LocalNote) => void;

  /** Optional: pass these to enable "Move to collection". */
  folders?: LocalFolder[];
  onMoveToFolder?: (note: LocalNote, folderId: string | null) => void;
}

const SCREEN_PADDING = 8;

// Taller rows on phones (py-3), compact on desktop (md:py-2)
const itemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--hover)] active:bg-[var(--active)] md:py-2";

const dangerClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 transition-colors hover:bg-[color-mix(in_srgb,#ef4444_14%,transparent)] active:bg-[color-mix(in_srgb,#ef4444_22%,transparent)] md:py-2";

const iconClass = "shrink-0 text-[var(--muted)]";

export default function NoteContextMenu({
  note,
  x,
  y,
  onClose,
  onTogglePin,
  onArchive,
  onTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  folders = [],
  onMoveToFolder,
}: NoteContextMenuProps) {
  const isMobile = useIsMobile();
  const [view, setView] = useState<"main" | "move">("main");
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  function run(action: () => void) {
    action();
    onClose();
  }

  // Desktop only: measure the menu and keep it on screen
  useLayoutEffect(() => {
    if (isMobile) return;

    const menu = menuRef.current;
    if (!menu) return;

    const { width, height } = menu.getBoundingClientRect();

    let top = y;
    if (y + height > window.innerHeight - SCREEN_PADDING) {
      top = y - height;
    }

    top = Math.max(
      SCREEN_PADDING,
      Math.min(top, window.innerHeight - height - SCREEN_PADDING),
    );

    const left = Math.max(
      SCREEN_PADDING,
      Math.min(x, window.innerWidth - width - SCREEN_PADDING),
    );

    setPosition({ left, top });
  }, [x, y, view, isMobile]);

  const collections = folders
    .filter((folder) => !folder.isArchived && !folder.isTrashed)
    .sort((a, b) => a.name.localeCompare(b.name));

  const currentFolderId = note.folderId ?? null;

  const body = note.isTrashed ? (
    <>
      <button
        type="button"
        onClick={() => run(() => onRestoreFromTrash(note))}
        className={itemClass}
      >
        <RotateCcw size={16} className={iconClass} />
        <span>Restore note</span>
      </button>

      <div className="my-1 border-t border-[var(--border)]" />

      <button
        type="button"
        onClick={() => run(() => onDeletePermanently(note))}
        className={dangerClass}
      >
        <Trash2 size={16} className="shrink-0" />
        <span>Delete permanently</span>
      </button>
    </>
  ) : view === "move" ? (
    <>
      <button
        type="button"
        onClick={() => setView("main")}
        className="mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)] md:py-2"
      >
        <ChevronLeft size={14} />
        Move to collection
      </button>

      <button
        type="button"
        onClick={() => run(() => onMoveToFolder?.(note, null))}
        className={itemClass}
      >
        <span className="flex-1 text-left">No collection</span>
        {currentFolderId === null && <Check size={14} />}
      </button>

      {collections.length > 0 && (
        <div className="my-1 border-t border-[var(--border)]" />
      )}

      {collections.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => run(() => onMoveToFolder?.(note, folder.id))}
          className={itemClass}
        >
          <Folder size={16} className={iconClass} />
          <span className="min-w-0 flex-1 truncate text-left">
            {folder.name}
          </span>
          {currentFolderId === folder.id && <Check size={14} />}
        </button>
      ))}

      {collections.length === 0 && (
        <p className="px-3 py-2 text-xs text-[var(--muted)]">
          No collections yet. Create one from the sidebar first.
        </p>
      )}
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => run(() => onTogglePin(note))}
        className={itemClass}
      >
        <Pin size={16} className={iconClass} />
        <span>{note.isPinned ? "Unpin note" : "Pin note"}</span>
      </button>

      {onMoveToFolder && (
        <button
          type="button"
          onClick={() => setView("move")}
          className={itemClass}
        >
          <Folder size={16} className={iconClass} />
          <span className="flex-1 text-left">Move to collection</span>
          <ChevronRight size={14} className={iconClass} />
        </button>
      )}

      <button
        type="button"
        onClick={() => run(() => onArchive(note))}
        className={itemClass}
      >
        <Archive size={16} className={iconClass} />
        <span>Archive</span>
      </button>

      <div className="my-1 border-t border-[var(--border)]" />

      <button
        type="button"
        onClick={() => run(() => onTrash(note))}
        className={dangerClass}
      >
        <Trash2 size={16} className="shrink-0" />
        <span>Move to Trash</span>
      </button>
    </>
  );

  /* Phones: bottom sheet */
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-[9999]"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div
          className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface)] p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-[var(--foreground)] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mb-2 mt-1 h-1 w-10 rounded-full bg-[var(--border)]" />

          <p className="truncate px-3 pb-2 text-xs font-medium text-[var(--muted)]">
            {note.title?.trim() || "Untitled Note"}
          </p>

          {body}
        </div>
      </div>
    );
  }

  /* Desktop: floating menu at the cursor */
  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-56 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--foreground)] shadow-2xl"
      style={{
        left: position.left,
        top: position.top,
        maxHeight: `calc(100vh - ${SCREEN_PADDING * 2}px)`,
      }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {body}
    </div>
  );
}