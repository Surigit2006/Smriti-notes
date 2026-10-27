
"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteArchiveDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteArchiveDialog({
  open,
  onCancel,
  onConfirm,
}: DeleteArchiveDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-archive-title"
        aria-describedby="delete-archive-description"
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--foreground)] shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <AlertTriangle size={21} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id="delete-archive-title"
              className="text-base font-semibold"
            >
              Delete permanently?
            </h2>
            <p
              id="delete-archive-description"
              className="mt-2 text-sm leading-relaxed text-[var(--muted)]"
            >
              This note will be permanently deleted from your device.
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--hover)]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <Trash2 size={15} />
            Delete permanently
          </button>
        </div>
      </section>
    </div>
  );
}
