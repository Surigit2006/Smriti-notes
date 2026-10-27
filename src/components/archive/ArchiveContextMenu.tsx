
"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArchiveRestore, Trash2 } from "lucide-react";
import DeleteArchiveDialog from "@/components/archive/DeleteArchiveDialog";

interface ArchiveContextMenuProps {
  noteId: string;
  /** Viewport coordinates (clientX / clientY or a button's rect edge). */
  x: number;
  y: number;
  /** "left": menu's left edge at x. "right": menu's right edge at x. */
  align?: "left" | "right";
  onUnarchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onClose: () => void;
}

const EDGE = 8;

export default function ArchiveContextMenu({
  noteId,
  x,
  y,
  align = "left",
  onUnarchive,
  onDelete,
  onClose,
}: ArchiveContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cancelDelete = useCallback(() => {
    setConfirmDelete(false);
  }, []);

  // Measure and clamp the menu inside the viewport.
  useLayoutEffect(() => {
    if (confirmDelete) return;

    const el = menuRef.current;
    if (!el) return;

    const { width, height } = el.getBoundingClientRect();
    const rawLeft = align === "right" ? x - width : x;
    const left = Math.max(
      EDGE,
      Math.min(rawLeft, window.innerWidth - width - EDGE),
    );
    const top =
      y + height + EDGE > window.innerHeight
        ? Math.max(EDGE, y - height - 4)
        : y;

    setPos({ left, top });
  }, [x, y, align, confirmDelete]);

  useEffect(() => {
    if (confirmDelete) return;

    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const items = Array.from(
          menuRef.current?.querySelectorAll<HTMLButtonElement>(
            "[role='menuitem']",
          ) ?? [],
        );

        if (!items.length) return;

        const index = items.indexOf(
          document.activeElement as HTMLButtonElement,
        );

        const next =
          event.key === "ArrowDown"
            ? items[(index + 1) % items.length]
            : items[(index - 1 + items.length) % items.length];

        next?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose, confirmDelete]);

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete(noteId);
  };

  return createPortal(
    <>
      {!confirmDelete ? (
        <>
          {/* Outside click / outside right-click layer */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[9998] cursor-default"
            onClick={onClose}
            onContextMenu={(event) => {
              event.preventDefault();
              onClose();
            }}
          />

          {/* Context menu */}
          <div
            ref={menuRef}
            role="menu"
            aria-label="Archived note actions"
            style={{
              position: "fixed",
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              visibility: pos ? "visible" : "hidden",
            }}
            className="z-[9999] w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--foreground)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--hover)] focus-visible:bg-[var(--hover)] focus-visible:outline-none"
              onClick={() => {
                onClose();
                onUnarchive(noteId);
              }}
            >
              <ArchiveRestore size={16} />
              <span>Unarchive</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              <span>Delete permanently</span>
            </button>
          </div>
        </>
      ) : (
        <DeleteArchiveDialog
          open={confirmDelete}
          onCancel={cancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>,
    document.body,
  );
}
