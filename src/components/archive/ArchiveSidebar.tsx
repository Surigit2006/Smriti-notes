"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  ArrowLeft,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";

import type { LocalNote } from "@/database/dexie";
import ArchiveContextMenu from "@/components/archive/ArchiveContextMenu";
import ThemePicker from "@/components/theme/ThemePicker";

interface ArchiveSidebarProps {
  notes: LocalNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: LocalNote) => void;
  onBack: () => void;
  onUnarchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;

  /** Phone layout: the sidebar is shown inside a slide-over drawer. */
  isMobile?: boolean;
  onClose?: () => void;
}

interface MenuState {
  noteId: string;
  x: number;
  y: number;
  align: "left" | "right";
}

const STORAGE_KEY = "smriti.archive.sidebar.collapsed";

/* ------------------------------ Style tokens ------------------------------ */
/* Same tokens as the main Sidebar so both always look identical in every theme. */

const railButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

const miniButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--active)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:h-6 md:w-6";

const navButton =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors md:py-2";

// Active = bright + highlighted, inactive = dim (brightens on hover)
const activeStyle = "bg-[var(--active)] text-[var(--foreground)] font-medium";
const inactiveStyle =
  "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]";

const sectionLabel =
  "text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]";

export default function ArchiveSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onBack,
  onUnarchive,
  onDelete,
  isMobile = false,
  onClose,
}: ArchiveSidebarProps) {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // Restore the remembered state after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setCollapsedPersist = useCallback((value: boolean) => {
    setCollapsed(value);
    setMenu(null);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) =>
      (note.title || "Untitled note").toLowerCase().includes(query),
    );
  }, [notes, search]);

  const openContextMenu = (event: React.MouseEvent, noteId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({ noteId, x: event.clientX, y: event.clientY, align: "left" });
  };

  const expandAndSearch = () => {
    setCollapsedPersist(false);
    window.setTimeout(() => searchRef.current?.focus(), 220);
  };

  // Portaled to <body> so it stays anchored to the screen even when the sidebar
  // sits inside a transformed slide-over drawer on phones.
  const contextMenu =
    menu && typeof document !== "undefined"
      ? createPortal(
          <ArchiveContextMenu
            noteId={menu.noteId}
            x={menu.x}
            y={menu.y}
            align={menu.align}
            onClose={closeMenu}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
          />,
          document.body,
        )
      : null;

  /* ------------------------------- Collapsed rail ---------------------------- */
  /* Desktop only: on phones the sidebar lives in a drawer, so it never collapses. */

  if (collapsed && !isMobile) {
    return (
      <>
        <aside
          aria-label="Archive"
          className="smriti-sidebar relative z-10 flex h-full w-16 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--sidebar-background)] py-4 text-[var(--foreground)]"
        >
          <button
            type="button"
            onClick={() => setCollapsedPersist(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className={railButton}
          >
            <PanelLeftOpen size={18} />
          </button>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              title="Back to notes"
              aria-label="Back to notes"
              className={railButton}
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={expandAndSearch}
              title="Search archived notes"
              aria-label="Search archived notes"
              className={railButton}
            >
              <Search size={18} />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2">
            <Archive
              size={18}
              aria-hidden="true"
              className="text-[var(--muted)]"
            />
            <ThemePicker />
          </div>
        </aside>

        {contextMenu}
      </>
    );
  }

  /* --------------------------------- Expanded -------------------------------- */

  return (
    <>
      <aside
        aria-label="Archive"
        className={`smriti-sidebar relative z-10 flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-background)] text-[var(--foreground)] transition-[width] duration-200 ${
          isMobile
            ? "h-full w-full min-w-64 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
            : "h-full w-[280px]"
        }`}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
          <h2 className="flex min-w-0 items-center gap-2 truncate text-[15px] font-semibold tracking-tight">
            <Archive size={16} className="shrink-0 text-[var(--muted)]" />
            Archive
          </h2>

          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              title="Close sidebar"
              aria-label="Close sidebar"
              className={miniButton + " h-9 w-9"}
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsedPersist(true)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className={miniButton + " md:h-8 md:w-8"}
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Back + search */}
        <div className="shrink-0 space-y-0.5 px-2 pb-2">
          <button
            type="button"
            onClick={onBack}
            className={`${navButton} ${inactiveStyle}`}
          >
            <ArrowLeft size={15} className="ml-1 shrink-0" />
            <span>Back to notes</span>
          </button>

          <div className="pt-1">
            {/* 16px on phones stops iOS from zooming the page when the field is focused */}
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearch("");
              }}
              placeholder="Search archived notes..."
              aria-label="Search archived notes"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] md:text-[13px]"
            />
          </div>
        </div>

        {/* Note list */}
        <div className="smriti-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3 pt-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 pb-1.5 pt-1 ${sectionLabel}`}
          >
            <Archive size={12} />
            <span>Archived</span>
            <span className="ml-auto font-normal">{notes.length}</span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-[var(--muted)]">
              {search ? "No matching notes" : "No archived notes"}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                const isMenuOpen = menu?.noteId === note.id;
                const isHovered = hoveredId === note.id;
                const label = note.title?.trim() || "Untitled note";

                return (
                  <div
                    key={note.id}
                    onMouseEnter={() => setHoveredId(note.id)}
                    onMouseLeave={() =>
                      setHoveredId((id) => (id === note.id ? null : id))
                    }
                    onContextMenu={(event) => openContextMenu(event, note.id)}
                    className="group relative"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        onSelectNote(note);
                      }}
                      aria-current={isSelected ? "true" : undefined}
                      className={`${navButton} pr-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        isSelected
                          ? activeStyle
                          : isMenuOpen
                            ? "bg-[var(--hover)] text-[var(--foreground)]"
                            : inactiveStyle
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </button>

                    <button
                      type="button"
                      title="Note options"
                      aria-label={`Actions for ${label}`}
                      aria-haspopup="menu"
                      aria-expanded={isMenuOpen}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (isMenuOpen) {
                          closeMenu();
                          return;
                        }

                        const rect =
                          event.currentTarget.getBoundingClientRect();
                        setMenu({
                          noteId: note.id,
                          x: rect.right,
                          y: rect.bottom + 4,
                          align: "right",
                        });
                      }}
                      onFocus={() => setHoveredId(note.id)}
                      className={`${miniButton} absolute right-1 top-1/2 -translate-y-1/2 transition-opacity [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100 ${
                        isSelected || isHovered || isMenuOpen
                          ? "opacity-100"
                          : "pointer-events-none opacity-0"
                      }`}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center gap-1 border-t border-[var(--border)] p-2">
          <p className="min-w-0 flex-1 px-2.5 text-[11px] leading-snug text-[var(--muted)]">
            Archived notes are hidden from your main list.
          </p>
          <ThemePicker />
        </div>
      </aside>

      {contextMenu}
    </>
  );
}