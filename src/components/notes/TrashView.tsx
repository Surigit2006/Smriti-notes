"use client";

import { AlertTriangle, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { LocalNote } from "@/database/dexie";

interface TrashViewProps {
  notes: LocalNote[];
  onRestore: (note: LocalNote) => void;
  onDeletePermanently: (note: LocalNote) => void | Promise<void>;
  onEmptyTrash: () => void | Promise<void>;
  onContextMenu: (
    event: React.MouseEvent<HTMLDivElement>,
    note: LocalNote,
  ) => void;
}

type DeleteDialog =
  | { type: "single"; note: LocalNote }
  | { type: "all" }
  | null;

function getPreview(note: LocalNote, length = 120) {
  return (
    (note.content ?? "").trim().replace(/\s+/g, " ").slice(0, length) ||
    "Empty note"
  );
}

function noteCount(count: number) {
  return `${count} ${count === 1 ? "note" : "notes"}`;
}

export default function TrashView({
  notes,
  onRestore,
  onDeletePermanently,
  onEmptyTrash,
  onContextMenu,
}: TrashViewProps) {
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) => {
      return (
        (note.title ?? "").toLowerCase().includes(query) ||
        (note.content ?? "").toLowerCase().includes(query)
      );
    });
  }, [notes, search]);

  // Escape to close + keep Tab focus inside the dialog
  useEffect(() => {
    if (!deleteDialog) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        setDeleteDialog(null);
        return;
      }

      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          "button:not(:disabled)",
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteDialog, isDeleting]);

  // Focus the safe option (Cancel) when the dialog opens
  useEffect(() => {
    if (deleteDialog) cancelRef.current?.focus();
  }, [deleteDialog]);

  async function confirmDelete() {
    if (!deleteDialog || isDeleting) return;

    setIsDeleting(true);

    try {
      if (deleteDialog.type === "single") {
        await onDeletePermanently(deleteDialog.note);
      } else {
        await onEmptyTrash();
      }

      setDeleteDialog(null);
    } catch (error) {
      console.error("Failed to permanently delete trash:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const isEmptyingTrash = deleteDialog?.type === "all";
  const selectedNote =
    deleteDialog?.type === "single" ? deleteDialog.note : null;

  const previewNotes = notes.slice(0, 3);
  const extraCount = notes.length - previewNotes.length;

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="shrink-0 border-b border-[var(--border)] px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Trash2 size={19} className="text-[var(--muted)]" />

              <h2 className="text-xl font-semibold">Trash</h2>
            </div>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {notes.length === 0 ? (
                "Deleted notes will show up here."
              ) : (
                <>
                  <span className="font-medium tabular-nums text-[var(--foreground)]">
                    {noteCount(notes.length)}
                  </span>{" "}
                  in Trash. Restore them or delete them for good.
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={notes.length === 0}
            onClick={() => setDeleteDialog({ type: "all" })}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Empty Trash</span>
          </button>
        </div>
      </header>

      {/* Notes */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
        {filteredNotes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Trash2
                size={36}
                className="mx-auto text-[var(--muted)] opacity-50"
              />

              <p className="mt-3 text-sm font-medium">
                {search ? "No matching notes" : "Trash is empty"}
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {search
                  ? "Try a different search."
                  : "Notes moved to Trash will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onContextMenu={(event) => onContextMenu(event, note)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 transition hover:bg-[var(--hover)] hover:shadow-sm sm:gap-4 sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">
                    {note.title || "Untitled Note"}
                  </h3>

                  <p className="mt-1 truncate text-xs text-[var(--muted)]">
                    {getPreview(note)}
                  </p>
                </div>

                <div className="hidden shrink-0 text-xs text-[var(--muted)] md:block">
                  {note.trashedAt
                    ? new Date(note.trashedAt).toLocaleDateString()
                    : ""}
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                  <button
                    type="button"
                    title="Restore note"
                    aria-label={`Restore ${note.title || "Untitled Note"}`}
                    onClick={() => onRestore(note)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--active)] hover:text-[var(--foreground)]"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    title="Delete permanently"
                    aria-label={`Delete permanently ${note.title || "Untitled Note"}`}
                    onClick={() => setDeleteDialog({ type: "single", note })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--background)] px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search trash..."
              aria-label="Search trash"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
            />
          </div>
        </div>
      </footer>

      {/* Confirmation dialog (single note + empty trash) */}
      {deleteDialog && (
        <div
          className="trash-scrim fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setDeleteDialog(null);
            }
          }}
        >
          <style>{`
            @keyframes trash-fade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes trash-pop {
              from { opacity: 0; transform: translateY(10px) scale(0.97) }
              to { opacity: 1; transform: none }
            }
            .trash-scrim { animation: trash-fade 0.16s ease-out }
            .trash-panel { animation: trash-pop 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) }
            @media (prefers-reduced-motion: reduce) {
              .trash-scrim, .trash-panel { animation: none }
            }
          `}</style>

          <div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="trash-dialog-title"
            aria-describedby="trash-dialog-description"
            className="trash-panel relative w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)]"
          >
            <button
              type="button"
              aria-label="Close confirmation"
              disabled={isDeleting}
              onClick={() => setDeleteDialog(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
            >
              <X size={17} />
            </button>

            <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-8 ring-red-500/5">
                <AlertTriangle size={26} />
              </div>

              <h3
                id="trash-dialog-title"
                className="mt-5 text-lg font-semibold tracking-tight"
              >
                {isEmptyingTrash ? "Empty Trash?" : "Delete this note?"}
              </h3>

              <p
                id="trash-dialog-description"
                className="mt-2 text-sm leading-6 text-[var(--muted)]"
              >
                {isEmptyingTrash
                  ? `${noteCount(notes.length)} will be permanently deleted.`
                  : "This note will be permanently deleted."}{" "}
                You can't undo this.
              </p>

              {/* What will be deleted */}
              <div className="mt-5 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] text-left">
                {isEmptyingTrash ? (
                  <ul className="divide-y divide-[var(--border)]">
                    {previewNotes.map((note) => (
                      <li
                        key={note.id}
                        className="flex items-center gap-2.5 px-3.5 py-2.5"
                      >
                        <Trash2
                          size={14}
                          className="shrink-0 text-[var(--muted)]"
                        />
                        <span className="truncate text-sm">
                          {note.title || "Untitled Note"}
                        </span>
                      </li>
                    ))}

                    {extraCount > 0 && (
                      <li className="px-3.5 py-2.5 text-xs text-[var(--muted)]">
                        and {extraCount} more {extraCount === 1 ? "note" : "notes"}
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="px-3.5 py-3">
                    <p className="truncate text-sm font-medium">
                      {selectedNote?.title || "Untitled Note"}
                    </p>

                    <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[var(--muted)]">
                      {selectedNote ? getPreview(selectedNote, 160) : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  ref={cancelRef}
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteDialog(null)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    isDeleting || (isEmptyingTrash && notes.length === 0)
                  }
                  onClick={confirmDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      {isEmptyingTrash ? "Empty Trash" : "Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}