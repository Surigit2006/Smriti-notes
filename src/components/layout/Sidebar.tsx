"use client";

import type React from "react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Archive,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  LogIn,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import type { LocalFolder, LocalNote } from "@/database/dexie";
import NoteList, { NOTE_DRAG_TYPE } from "@/components/notes/NoteList";
import ThemePicker from "@/components/theme/ThemePicker";

interface SidebarProps {
  notes?: LocalNote[];
  trashedNotes?: LocalNote[];
  selectedNoteId: string | null;
  activeView: "notes" | "archive" | "trash";

  onSelectNote: (note: LocalNote) => void;
  onContextMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    note: LocalNote,
  ) => void;

  onShowNotes: () => void;
  onShowTrash: () => void;
  onNewNote?: (folderId?: string | null) => void;

  /* Collections (folders). All optional so the parent never breaks. */
  folders?: LocalFolder[];
  selectedFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string) => Promise<void>;
  onRenameFolder?: (id: string, name: string) => Promise<void>;
  onDeleteFolder?: (id: string) => Promise<void>;
  onArchiveFolder?: (id: string) => Promise<void>;
  onTrashFolder?: (id: string) => Promise<void>;
  onMoveNoteToFolder?: (
    noteId: string,
    folderId: string | null,
  ) => Promise<void>;
}

/* ------------------------------ Style tokens ------------------------------ */

const HOVER_OPEN_DELAY = 220; // ms before a hovered collection expands
const HOVER_CLOSE_DELAY = 280; // ms before it collapses again
const LOOSE = "__loose__"; // drop-target id for the plain "Notes" list

const railButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)]";

const miniButton =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--active)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

const navButton =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors";

// Active = bright + highlighted, inactive = dim (brightens on hover)
const activeStyle = "bg-[var(--active)] text-[var(--foreground)] font-medium";
const inactiveStyle =
  "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]";

const sectionLabel =
  "text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]";

// Visible on hover/keyboard focus, always visible on touch screens
const showOnHover =
  "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100";

type MenuState = { folder: LocalFolder; x: number; y: number } | null;

function isNoteDrag(event: React.DragEvent) {
  return Array.from(event.dataTransfer.types).includes(NOTE_DRAG_TYPE);
}

/* -------------------------------- Component -------------------------------- */

export default function Sidebar({
  notes = [],
  trashedNotes = [],
  folders = [],
  selectedNoteId,
  activeView,
  onSelectNote,
  onContextMenu,
  onShowNotes,
  onShowTrash,
  onNewNote,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveNoteToFolder,
}: SidebarProps) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  // Which collections are open: pinned by click, or temporarily by hover
  const [pinnedOpen, setPinnedOpen] = useState<Set<string>>(new Set());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // Inline rename
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const editingIdRef = useRef<string | null>(null);
  const committingRef = useRef(false);
  const pendingCreatedName = useRef<string | null>(null);

  const [menu, setMenu] = useState<MenuState>(null);

  /* ------------------------------ Derived data ------------------------------ */

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeTrashedNotes = Array.isArray(trashedNotes) ? trashedNotes : [];
  const safeFolders = Array.isArray(folders) ? folders : [];

  const activeNotes = safeNotes.filter(
    (note) => !note.isArchived && !note.isTrashed,
  );

  const collections = safeFolders
    .filter((folder) => !folder.isArchived && !folder.isTrashed)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));

  const collectionIds = new Set(collections.map((folder) => folder.id));

  const notesByFolder = new Map<string, LocalNote[]>();
  for (const note of activeNotes) {
    if (note.folderId && collectionIds.has(note.folderId)) {
      const list = notesByFolder.get(note.folderId) ?? [];
      list.push(note);
      notesByFolder.set(note.folderId, list);
    }
  }

  const looseNotes = activeNotes.filter(
    (note) => !note.folderId || !collectionIds.has(note.folderId),
  );

  const pinnedNotes = activeNotes.filter((note) => note.isPinned);
  const query = searchQuery.trim().toLowerCase();

  const searchResults = activeNotes.filter(
    (note) =>
      (note.title ?? "").toLowerCase().includes(query) ||
      (note.content ?? "").toString().toLowerCase().includes(query),
  );

  /* -------------------------------- Effects --------------------------------- */

  // Keep the selected note visible: open the collection that contains it
  useEffect(() => {
    if (!selectedNoteId) return;

    const folderId = safeNotes.find((note) => note.id === selectedNoteId)
      ?.folderId;
    if (!folderId) return;

    setPinnedOpen((prev) =>
      prev.has(folderId) ? prev : new Set(prev).add(folderId),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  // After creating a collection, wait for it to appear, then rename it inline
  useEffect(() => {
    const pending = pendingCreatedName.current;
    if (!pending) return;

    const created = safeFolders.find((folder) => folder.name === pending);
    if (created) {
      pendingCreatedName.current = null;
      startRename(created);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  /* ------------------------------ Hover expand ------------------------------ */

  function hoverEnter(id: string) {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (hoverId === id) return;

    enterTimer.current = setTimeout(() => setHoverId(id), HOVER_OPEN_DELAY);
  }

  function hoverLeave(id: string) {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);

    leaveTimer.current = setTimeout(
      () => setHoverId((current) => (current === id ? null : current)),
      HOVER_CLOSE_DELAY,
    );
  }

  function toggleOpen(id: string) {
    const wasPinned = pinnedOpen.has(id);

    setPinnedOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // Collapse right away instead of waiting for the mouse to leave
    if (wasPinned) setHoverId(null);
  }

  function openPinned(id: string) {
    setPinnedOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  /* ----------------------------- Create / rename ---------------------------- */

  function nextUntitledName() {
    const taken = new Set(safeFolders.map((folder) => folder.name.toLowerCase()));
    if (!taken.has("untitled")) return "Untitled";

    let n = 2;
    while (taken.has(`untitled ${n}`)) n += 1;
    return `Untitled ${n}`;
  }

  async function createCollection() {
    if (!onCreateFolder) return;

    const name = nextUntitledName();
    pendingCreatedName.current = name;
    setCollectionsOpen(true);

    try {
      await onCreateFolder(name);
    } catch (error) {
      pendingCreatedName.current = null;
      window.alert(
        error instanceof Error ? error.message : "Could not create collection.",
      );
    }
  }

  function startRename(folder: LocalFolder) {
    editingIdRef.current = folder.id;
    setEditingId(folder.id);
    setEditingValue(folder.name);
    setEditError(null);
    setMenu(null);
  }

  function closeEditor() {
    editingIdRef.current = null;
    committingRef.current = false;
    setEditingId(null);
    setEditError(null);
  }

  async function commitRename(folder: LocalFolder, fromBlur = false) {
    if (committingRef.current) return;

    const name = editingValue.trim();

    if (!name || name === folder.name) {
      closeEditor();
      return;
    }

    if (!onRenameFolder) {
      closeEditor();
      return;
    }

    committingRef.current = true;

    try {
      await onRenameFolder(folder.id, name);
      closeEditor();
    } catch (error) {
      committingRef.current = false;

      if (fromBlur) {
        closeEditor();
      } else {
        setEditError(
          error instanceof Error ? error.message : "Could not rename.",
        );
      }
    }
  }

  async function deleteCollection(folder: LocalFolder) {
    setMenu(null);

    const count = notesByFolder.get(folder.id)?.length ?? 0;
    const detail =
      count > 0
        ? ` Its ${count} note${count === 1 ? "" : "s"} will move back to Notes.`
        : "";

    if (!window.confirm(`Delete "${folder.name}"?${detail}`)) return;

    try {
      await onDeleteFolder?.(folder.id);

      setPinnedOpen((prev) => {
        const next = new Set(prev);
        next.delete(folder.id);
        return next;
      });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete collection.",
      );
    }
  }

  /* ------------------------------ Drag and drop ----------------------------- */

  async function dropNote(
    event: React.DragEvent<HTMLElement>,
    folderId: string | null,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const noteId =
      event.dataTransfer.getData(NOTE_DRAG_TYPE) ||
      event.dataTransfer.getData("text/plain");

    setDraggingOver(null);

    if (!noteId || !onMoveNoteToFolder) return;

    const note = safeNotes.find((item) => item.id === noteId);
    if (note && (note.folderId ?? null) === folderId) return;

    try {
      await onMoveNoteToFolder(noteId, folderId);
      if (folderId) openPinned(folderId);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not move note.",
      );
    }
  }

  /* ------------------------------- Small helpers ----------------------------- */

  function showAllNotes() {
    setSearchQuery("");
    onSelectFolder?.(null);
    onShowNotes();
  }

  function newNoteIn(folderId: string | null) {
    if (folderId) openPinned(folderId);
    onNewNote?.(folderId);
  }

  function openMenuFromButton(
    event: React.MouseEvent<HTMLElement>,
    folder: LocalFolder,
  ) {
    event.stopPropagation();
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ folder, x: rect.left, y: rect.bottom + 4 });
  }

  /* ------------------------------ Collection row ----------------------------- */

  function renderCollection(folder: LocalFolder) {
    const folderNotes = notesByFolder.get(folder.id) ?? [];
    const isEditing = editingId === folder.id;
    const expanded = pinnedOpen.has(folder.id) || hoverId === folder.id;
    const isDropTarget = draggingOver === folder.id;
    const menuOpen = menu?.folder.id === folder.id;

    return (
      <div
        key={folder.id}
        onMouseEnter={() => hoverEnter(folder.id)}
        onMouseLeave={() => hoverLeave(folder.id)}
        onDragEnter={(event) => {
          if (isNoteDrag(event)) hoverEnter(folder.id);
        }}
        onDragOver={(event) => {
          if (!isNoteDrag(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setDraggingOver(folder.id);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDraggingOver((current) =>
              current === folder.id ? null : current,
            );
          }
        }}
        onDrop={(event) => void dropNote(event, folder.id)}
        className={`rounded-lg transition-colors ${
          isDropTarget ? "bg-[var(--active)] ring-1 ring-[var(--accent)]" : ""
        }`}
      >
        {isEditing ? (
          <div className="px-1 py-1">
            <div className="flex items-center gap-2 px-1.5">
              <Folder size={15} className="shrink-0 text-[var(--muted)]" />
              <input
                autoFocus
                value={editingValue}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  setEditingValue(event.target.value);
                  setEditError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void commitRename(folder);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    closeEditor();
                  }
                }}
                onBlur={() => {
                  if (editingIdRef.current !== folder.id) return;
                  void commitRename(folder, true);
                }}
                aria-label="Collection name"
                className={`min-w-0 flex-1 rounded-md border bg-[var(--surface)] px-2 py-1 text-[13px] text-[var(--foreground)] outline-none ${
                  editError ? "border-red-500" : "border-[var(--accent)]"
                }`}
              />
            </div>

            {editError && (
              <p className="px-2 pl-8 pt-1 text-[11px] text-red-500">
                {editError}
              </p>
            )}
          </div>
        ) : (
          <div
            className="group relative"
            onContextMenu={(event) => {
              event.preventDefault();
              setMenu({ folder, x: event.clientX, y: event.clientY });
            }}
          >
            <button
              type="button"
              onClick={() => toggleOpen(folder.id)}
              aria-expanded={expanded}
              className={`${navButton} ${
                expanded
                  ? "text-[var(--foreground)] hover:bg-[var(--hover)]"
                  : inactiveStyle
              }`}
            >
              <ChevronRight
                size={12}
                className={`shrink-0 transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
              {expanded ? (
                <FolderOpen size={15} className="shrink-0" />
              ) : (
                <Folder size={15} className="shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate text-left">
                {folder.name}
              </span>
              <span
                className={`text-[11px] tabular-nums opacity-70 transition-opacity ${
                  menuOpen
                    ? "opacity-0"
                    : "group-hover:opacity-0 [@media(hover:none)]:opacity-0"
                }`}
              >
                {folderNotes.length}
              </span>
            </button>

            <div
              className={`absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5 transition-opacity ${
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              }`}
            >
              <button
                type="button"
                title="New note in this collection"
                aria-label={`New note in ${folder.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  newNoteIn(folder.id);
                }}
                className={miniButton}
              >
                <Plus size={14} />
              </button>

              <button
                type="button"
                title="Collection options"
                aria-label={`Options for ${folder.name}`}
                onClick={(event) => openMenuFromButton(event, folder)}
                className={miniButton}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Notes inside the collection (animated open/close) */}
        <div
          aria-hidden={!expanded}
          className={`grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out ${
            expanded && !isEditing
              ? "visible grid-rows-[1fr] opacity-100"
              : "invisible grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-[17px] border-l border-[var(--border)] pb-1 pl-1.5 pt-0.5">
              <NoteList
                notes={folderNotes}
                selectedNoteId={activeView === "notes" ? selectedNoteId : null}
                onSelectNote={onSelectNote}
                onContextMenu={onContextMenu}
                onMoveNoteToFolder={onMoveNoteToFolder}
                className="space-y-0.5"
                emptyMessage="Drag notes here"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- Collapsed rail ---------------------------- */

  if (collapsed) {
    return (
      <aside className="flex h-dvh w-16 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--sidebar-background)] py-4">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className={railButton}
        >
          <PanelLeftOpen size={18} />
        </button>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={showAllNotes}
            title="Notes"
            aria-label="Notes"
            className={railButton}
          >
            <FileText size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setCollapsed(false);
              setSearchOpen(true);
            }}
            title="Search"
            aria-label="Search"
            className={railButton}
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Pinned notes"
            aria-label="Pinned notes"
            className={railButton}
          >
            <Pin size={18} />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Collections"
            aria-label="Collections"
            className={railButton}
          >
            <Folder size={18} />
          </button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/archive")}
            title="Archive"
            aria-label="Archive"
            className={railButton}
          >
            <Archive size={18} />
          </button>

          <button
            type="button"
            onClick={onShowTrash}
            title="Trash"
            aria-label="Trash"
            className={railButton}
          >
            <Trash2 size={18} />
          </button>

          <ThemePicker />

          <button
            type="button"
            onClick={() => router.push("/login")}
            title="Login"
            aria-label="Login"
            className={railButton}
          >
            <LogIn size={18} />
          </button>
        </div>
      </aside>
    );
  }

  /* --------------------------------- Expanded -------------------------------- */

  return (
    <aside className="flex h-dvh w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar-background)] text-[var(--foreground)] transition-[width] duration-200">
      {/* Brand */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={showAllNotes}
          className="truncate rounded-md text-left text-[15px] font-semibold tracking-tight"
        >
          Smriti Notes
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className={miniButton + " h-8 w-8"}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* New note + search */}
      <div className="shrink-0 space-y-0.5 px-2 pb-2">
        <button
          type="button"
          onClick={() => newNoteIn(null)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--hover)] active:bg-[var(--active)]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <Plus size={14} />
          </span>
          <span>New note</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchOpen((open) => !open)}
          className={`${navButton} ${inactiveStyle}`}
        >
          <Search size={15} className="ml-1 shrink-0" />
          <span>Search</span>
        </button>

        {searchOpen && (
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchQuery("");
                setSearchOpen(false);
              }
            }}
            placeholder="Search your notes..."
            aria-label="Search your notes"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
        )}
      </div>

      {/* Scrollable navigation */}
      <div className="smriti-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-2">
        {query ? (
          /* ------------------------------ Search mode ----------------------------- */
          <section>
            <div
              className={`flex items-center gap-1.5 px-2.5 pb-1.5 pt-1 ${sectionLabel}`}
            >
              <Search size={12} />
              <span>Results</span>
              <span className="ml-auto font-normal">{searchResults.length}</span>
            </div>

            <NoteList
              notes={searchResults}
              selectedNoteId={activeView === "notes" ? selectedNoteId : null}
              onSelectNote={onSelectNote}
              onContextMenu={onContextMenu}
              className="space-y-0.5"
              emptyMessage="No matching notes found."
            />
          </section>
        ) : (
          <>
            {/* -------------------------------- Pinned ------------------------------- */}
            {pinnedNotes.length > 0 && (
              <section className="mb-5">
                <div
                  className={`flex items-center gap-1.5 px-2.5 pb-1.5 pt-1 ${sectionLabel}`}
                >
                  <Pin size={12} />
                  <span>Pinned</span>
                  <span className="ml-auto font-normal">
                    {pinnedNotes.length}
                  </span>
                </div>

                <NoteList
                  notes={pinnedNotes}
                  selectedNoteId={activeView === "notes" ? selectedNoteId : null}
                  onSelectNote={onSelectNote}
                  onContextMenu={onContextMenu}
                  onMoveNoteToFolder={onMoveNoteToFolder}
                  className="space-y-0.5"
                />
              </section>
            )}

            {/* ------------------------------ Collections ----------------------------- */}
            <section className="mb-5">
              <div className="group flex items-center justify-between pr-1">
                <button
                  type="button"
                  onClick={() => setCollectionsOpen((open) => !open)}
                  aria-expanded={collectionsOpen}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 pb-1.5 pt-1 transition-colors hover:text-[var(--foreground)] ${sectionLabel}`}
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform duration-200 ${
                      collectionsOpen ? "rotate-90" : ""
                    }`}
                  />
                  <span>Collections</span>
                </button>

                {onCreateFolder && (
                  <button
                    type="button"
                    onClick={() => void createCollection()}
                    title="New collection"
                    aria-label="New collection"
                    className={`${miniButton} ${showOnHover}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {collectionsOpen && (
                <div className="space-y-0.5">
                  {collections.map(renderCollection)}

                  {collections.length === 0 && onCreateFolder && (
                    <button
                      type="button"
                      onClick={() => void createCollection()}
                      className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2.5 text-left text-xs text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
                    >
                      <Plus size={13} />
                      Group notes into a collection
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* ---------------------------------- Notes -------------------------------- */}
            <section
              onDragOver={(event) => {
                if (!isNoteDrag(event)) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDraggingOver(LOOSE);
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  setDraggingOver((current) =>
                    current === LOOSE ? null : current,
                  );
                }
              }}
              onDrop={(event) => void dropNote(event, null)}
              className={`rounded-lg transition-colors ${
                draggingOver === LOOSE
                  ? "bg-[var(--hover)] ring-1 ring-[var(--accent)]"
                  : ""
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 pb-1.5 pt-1 ${sectionLabel}`}
              >
                <FileText size={12} />
                <span>Notes</span>
                <span className="ml-auto font-normal">{looseNotes.length}</span>
              </div>

              <NoteList
                notes={looseNotes}
                selectedNoteId={activeView === "notes" ? selectedNoteId : null}
                onSelectNote={onSelectNote}
                onContextMenu={onContextMenu}
                onMoveNoteToFolder={onMoveNoteToFolder}
                className="space-y-0.5"
                emptyMessage={
                  collections.length > 0 && activeNotes.length > 0
                    ? "Every note is in a collection."
                    : "No notes yet."
                }
              />
            </section>
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 space-y-0.5 border-t border-[var(--border)] p-2">
        <button
          type="button"
          onClick={() => router.push("/archive")}
          className={`${navButton} ${
            activeView === "archive" ? activeStyle : inactiveStyle
          }`}
        >
          <Archive size={15} className="ml-1 shrink-0" />
          <span>Archive</span>
        </button>

        <button
          type="button"
          onClick={onShowTrash}
          className={`${navButton} ${
            activeView === "trash" ? activeStyle : inactiveStyle
          }`}
        >
          <Trash2 size={15} className="ml-1 shrink-0" />
          <span>Trash</span>
          {safeTrashedNotes.length > 0 && (
            <span className="ml-auto rounded-full bg-[var(--hover)] px-2 py-0.5 text-[10px] tabular-nums">
              {safeTrashedNotes.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={`${navButton} min-w-0 flex-1 ${inactiveStyle}`}
          >
            <LogIn size={15} className="ml-1 shrink-0" />
            <span>Login</span>
          </button>

          <ThemePicker />
        </div>
      </div>

      {menu && (
        <CollectionMenu
          x={menu.x}
          y={menu.y}
          onRename={() => startRename(menu.folder)}
          onDelete={() => void deleteCollection(menu.folder)}
          onClose={() => setMenu(null)}
        />
      )}
    </aside>
  );
}

/* ------------------------------ Collection menu ------------------------------ */

function CollectionMenu({
  x,
  y,
  onRename,
  onDelete,
  onClose,
}: {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // Keep the menu fully on screen (flip above the cursor near the bottom)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const margin = 8;
    const { width, height } = el.getBoundingClientRect();

    let top = y;
    if (y + height > window.innerHeight - margin) top = y - height;

    top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));

    const left = Math.max(
      margin,
      Math.min(x, window.innerWidth - width - margin),
    );

    setPosition({ left, top });
  }, [x, y]);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) return;
      onClose();
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        zIndex: 9999,
      }}
      className="w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--foreground)] shadow-2xl"
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        role="menuitem"
        onClick={onRename}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--hover)]"
      >
        <Pencil size={15} className="text-[var(--muted)]" />
        Rename
      </button>

      <div className="my-1 border-t border-[var(--border)]" />

      <button
        type="button"
        role="menuitem"
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-[color-mix(in_srgb,#ef4444_14%,transparent)]"
      >
        <Trash2 size={15} />
        Delete collection
      </button>
    </div>,
    document.body,
  );
}