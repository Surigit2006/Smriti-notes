"use client";

import { Menu, Plus } from "lucide-react";

interface MobileTopBarProps {
  title: string;
  onOpenMenu: () => void;
  onNewNote?: () => void;
}

const buttonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)] active:bg-[var(--active)]";

export default function MobileTopBar({
  title,
  onOpenMenu,
  onNewNote,
}: MobileTopBarProps) {
  return (
    <header className="flex shrink-0 items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] px-2 pb-1.5 pt-[calc(env(safe-area-inset-top)+0.375rem)]">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open sidebar"
        className={buttonClass}
      >
        <Menu size={20} />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--foreground)]">
        {title}
      </h1>

      {onNewNote && (
        <button
          type="button"
          onClick={onNewNote}
          aria-label="New note"
          className={buttonClass}
        >
          <Plus size={20} />
        </button>
      )}
    </header>
  );
}