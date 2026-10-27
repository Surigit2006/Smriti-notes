"use client";

import { useCallback, useEffect, useState } from "react";

import MobileDrawer from "@/components/layout/MobileDrawer";
import MobileTopBar from "@/components/layout/MobileTopbar";
import Sidebar from "@/components/layout/Sidebar";
import NoteContextMenu from "@/components/notes/NoteContextMenu";
import NoteEditor from "@/components/notes/NoteEditor";
import TrashView from "@/components/notes/TrashView";
import { useIsMobile } from "@/hooks/useIsMobile";

import type { LocalFolder, LocalNote } from "@/database/dexie";

import {
  archiveLocalFolder,
  archiveLocalNote,
  createLocalFolder,
  createLocalNote,
  deleteLocalFolder,
  getLocalFolders,
  getLocalNotes,
  getTrashedNotes,
  moveLocalNoteToFolder,
  openLocalNote,
  permanentlyDeleteLocalNote,
  renameLocalFolder,
  restoreLocalNoteFromTrash,
  togglePinLocalNote,
  trashLocalFolder,
  trashLocalNote,
  updateLocalNote,
} from "@/database/notes";

interface ContextMenuState {
  note: LocalNote;
  x: number;
  y: number;
}

type ActiveView = "notes" | "archive" | "trash";

const LAST_OPENED_NOTE_KEY = "smriti-last-opened-note";

export default function HomePage() {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [openedNotes, setOpenedNotes] = useState<LocalNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [trashedNotes, setTrashedNotes] = useState<LocalNote[]>([]);
  const [folders, setFolders] = useState<LocalFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [previousNoteId, setPreviousNoteId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("notes");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Phone layout: the sidebar lives in a slide-over drawer
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Leaving phone width closes the drawer
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const activeNote = notes.find((note) => note.id === activeNoteId) ?? null;

  // Reload notes and trash after note actions.
  const loadNotes = useCallback(async () => {
    const [localNotes, trashNotes] = await Promise.all([
      getLocalNotes(),
      getTrashedNotes(),
    ]);

    setNotes(localNotes);
    setTrashedNotes(trashNotes);

    return { localNotes, trashNotes };
  }, []);

  // Reload folders after folder actions.
  const loadFolders = useCallback(async () => {
    const localFolders = await getLocalFolders();
    setFolders(localFolders);
    return localFolders;
  }, []);

  // Load IndexedDB data and restore the previously open note.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [localNotes, trashNotes, localFolders] = await Promise.all([
          getLocalNotes(),
          getTrashedNotes(),
          getLocalFolders(),
        ]);

        if (cancelled) return;

        setNotes(localNotes);
        setTrashedNotes(trashNotes);
        setFolders(localFolders);

        const savedNoteId = localStorage.getItem(LAST_OPENED_NOTE_KEY);

        if (savedNoteId) {
          const savedNote = localNotes.find((note) => note.id === savedNoteId);

          if (savedNote && !savedNote.isTrashed && !savedNote.isArchived) {
            await openLocalNote(savedNote.id);

            if (cancelled) return;

            setActiveNoteId(savedNote.id);
            setOpenedNotes([savedNote]);
            setSelectedFolderId(savedNote.folderId ?? null);
          } else {
            localStorage.removeItem(LAST_OPENED_NOTE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to load Smriti data:", error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the context menu when clicking elsewhere.
  useEffect(() => {
    function closeMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  // Persist the active note.
  useEffect(() => {
    if (!isHydrated) return;

    if (activeNoteId) {
      localStorage.setItem(LAST_OPENED_NOTE_KEY, activeNoteId);
    } else {
      localStorage.removeItem(LAST_OPENED_NOTE_KEY);
    }
  }, [activeNoteId, isHydrated]);

  // Open an existing note.
  async function handleOpenNote(note: LocalNote) {
    if (note.isTrashed || note.isArchived) return;

    setDrawerOpen(false);
    setActiveView("notes");
    setActiveNoteId(note.id);
    setSelectedFolderId(note.folderId ?? null);

    try {
      await openLocalNote(note.id);

      const now = new Date().toISOString();

      setNotes((current) =>
        current.map((item) =>
          item.id === note.id ? { ...item, lastOpenedAt: now } : item,
        ),
      );

      setOpenedNotes((current) => {
        const updatedNote = { ...note, lastOpenedAt: now };
        const exists = current.some((item) => item.id === note.id);

        return exists
          ? current.map((item) => (item.id === note.id ? updatedNote : item))
          : [...current, updatedNote];
      });
    } catch (error) {
      console.error("Could not open note:", error);
      window.alert("Could not open this note. Please try again.");
    }
  }

  // Create a note, optionally inside the selected folder.
  async function handleNewNote(folderId?: string | null) {
    try {
      setDrawerOpen(false);

      const note = await createLocalNote("Untitled Note", "");

      let newNote = note;

      if (folderId) {
        await updateLocalNote(note.id, { folderId });
        newNote = { ...note, folderId };
      }

      setNotes((current) => [
        newNote,
        ...current.filter((item) => item.id !== newNote.id),
      ]);

      setOpenedNotes((current) => [
        ...current.filter((item) => item.id !== newNote.id),
        newNote,
      ]);

      setSelectedFolderId(folderId ?? null);
      setActiveNoteId(newNote.id);
      setActiveView("notes");
      setContextMenu(null);

      localStorage.setItem(LAST_OPENED_NOTE_KEY, newNote.id);
    } catch (error) {
      console.error("Could not create note:", error);
      window.alert(
        error instanceof Error ? error.message : "Could not create a new note.",
      );
    }
  }

  // Select an already-open note.
  async function handleSelectNote(id: string) {
    const note = notes.find((item) => item.id === id);
    if (note) await handleOpenNote(note);
  }

  // Close a note tab.
  function handleCloseNote(id: string) {
    setOpenedNotes((current) => {
      const index = current.findIndex((note) => note.id === id);
      const next = current.filter((note) => note.id !== id);

      if (id === activeNoteId) {
        const replacement = next[index - 1] ?? next[index] ?? null;
        setActiveNoteId(replacement?.id ?? null);
      }

      return next;
    });
  }

  // Save editor changes.
  async function handleNoteChange(
    noteId: string,
    changes: Partial<Omit<LocalNote, "id" | "createdAt">>,
  ) {
    await updateLocalNote(noteId, changes);

    const now = new Date().toISOString();

    const applyChanges = (note: LocalNote): LocalNote =>
      note.id === noteId
        ? {
            ...note,
            ...changes,
            updatedAt: now,
            syncStatus: "pending",
          }
        : note;

    setNotes((current) => current.map(applyChanges));
    setOpenedNotes((current) => current.map(applyChanges));
  }

  // Sidebar navigation.
  function handleShowNotes() {
    setDrawerOpen(false);
    setActiveView("notes");
    setContextMenu(null);
  }

  function handleShowTrash() {
    setDrawerOpen(false);

    if (activeView !== "trash") {
      setPreviousNoteId(activeNoteId);
    }

    setActiveView("trash");
    setContextMenu(null);
  }

  function handleSelectFolder(folderId: string | null) {
    setSelectedFolderId(folderId);
    setActiveView("notes");
    setContextMenu(null);
  }

  // Folder CRUD and organization.
  async function handleCreateFolder(name: string) {
    await createLocalFolder(name.trim());
    await loadFolders();
  }

  async function handleRenameFolder(id: string, name: string) {
    await renameLocalFolder(id, name.trim());
    await loadFolders();
  }

  async function handleDeleteFolder(id: string) {
    await deleteLocalFolder(id);
    await Promise.all([loadFolders(), loadNotes()]);

    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  }

  async function handleArchiveFolder(id: string) {
    await archiveLocalFolder(id);
    await Promise.all([loadFolders(), loadNotes()]);

    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  }

  async function handleTrashFolder(id: string) {
    await trashLocalFolder(id);
    await Promise.all([loadFolders(), loadNotes()]);

    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  }

  async function handleMoveNoteToFolder(
    noteId: string,
    folderId: string | null,
  ) {
    await moveLocalNoteToFolder(noteId, folderId);
    await loadNotes();
  }

  // Pin or unpin a note.
  async function handleTogglePin(note: LocalNote) {
    await togglePinLocalNote(note.id);
    await loadNotes();
  }

  // Archive a note.
  async function handleArchive(note: LocalNote) {
    await archiveLocalNote(note.id);

    setOpenedNotes((current) => current.filter((item) => item.id !== note.id));

    if (activeNoteId === note.id) {
      setActiveNoteId(null);
    }

    await loadNotes();
  }

  // Move a note to Trash.
  async function handleTrash(note: LocalNote) {
    await trashLocalNote(note.id);

    setOpenedNotes((current) => current.filter((item) => item.id !== note.id));

    if (activeNoteId === note.id) {
      setActiveNoteId(null);
    }

    await loadNotes();
  }

  // Restore a trashed note.
  async function handleRestoreTrash(note: LocalNote) {
    await restoreLocalNoteFromTrash(note.id);
    await loadNotes();
    setActiveView("notes");
  }

  // Permanently delete a trashed note.
  async function handleDeletePermanently(note: LocalNote) {
    await permanentlyDeleteLocalNote(note.id);

    setTrashedNotes((current) => current.filter((item) => item.id !== note.id));
  }

  // Permanently delete all trashed notes.
  const handleEmptyTrash = async () => {
    const notesToDelete = [...trashedNotes];

    for (const note of notesToDelete) {
      await handleDeletePermanently(note);
    }
  };

  // Open the note context menu.
  function handleContextMenu(
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    note: LocalNote,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      note,
      x: event.clientX,
      y: event.clientY,
    });
  }

  // Loading screen.
  if (!isHydrated) {
    return (
      <main className="flex h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-background)] md:block">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 h-7 w-32 animate-pulse rounded-md bg-[var(--hover)]" />
            <div className="space-y-3">
              <div className="h-9 animate-pulse rounded-lg bg-[var(--hover)]" />
              <div className="h-9 animate-pulse rounded-lg bg-[var(--hover)]" />
              <div className="h-9 animate-pulse rounded-lg bg-[var(--hover)]" />
            </div>
            <div className="mt-8 space-y-3">
              <div className="h-4 w-20 animate-pulse rounded bg-[var(--hover)]" />
              <div className="h-8 animate-pulse rounded-lg bg-[var(--hover)]" />
              <div className="h-8 animate-pulse rounded-lg bg-[var(--hover)]" />
              <div className="h-8 animate-pulse rounded-lg bg-[var(--hover)]" />
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface)] px-4">
            <div className="h-8 w-28 animate-pulse rounded-lg bg-[var(--hover)]" />
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-8 sm:py-5">
              <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--hover)] sm:w-72" />
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--hover)]" />
            </div>
            <div className="flex flex-1 items-start px-4 py-6 sm:px-8 sm:py-8">
              <div className="w-full max-w-3xl space-y-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--hover)]" />
                <div className="h-5 w-full animate-pulse rounded bg-[var(--hover)]" />
                <div className="h-5 w-5/6 animate-pulse rounded bg-[var(--hover)]" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--hover)]" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const sidebar = (
    <Sidebar
      notes={notes}
      trashedNotes={trashedNotes}
      folders={folders}
      selectedFolderId={selectedFolderId}
      selectedNoteId={activeNoteId}
      activeView={activeView}
      onSelectNote={handleOpenNote}
      onContextMenu={handleContextMenu}
      onShowNotes={handleShowNotes}
      onShowTrash={handleShowTrash}
      onNewNote={handleNewNote}
      onSelectFolder={handleSelectFolder}
      onCreateFolder={handleCreateFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onArchiveFolder={handleArchiveFolder}
      onTrashFolder={handleTrashFolder}
      onMoveNoteToFolder={handleMoveNoteToFolder}
    />
  );

  return (
    <main className="flex h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {isMobile ? (
        <MobileDrawer open={drawerOpen} onClose={closeDrawer}>
          {sidebar}
        </MobileDrawer>
      ) : (
        sidebar
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        {isMobile && (
          <MobileTopBar
            title={
              activeView === "trash"
                ? "Trash"
                : activeNote?.title?.trim() || "Smriti Notes"
            }
            onOpenMenu={() => setDrawerOpen(true)}
            onNewNote={() => void handleNewNote(null)}
          />
        )}

        <div className="min-h-0 flex-1">
          {activeView === "trash" ? (
            <TrashView
              notes={trashedNotes}
              onRestore={handleRestoreTrash}
              onDeletePermanently={handleDeletePermanently}
              onEmptyTrash={handleEmptyTrash}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <NoteEditor
              key={activeNote?.id ?? "no-note"}
              note={activeNote}
              onNoteChange={handleNoteChange}
            />
          )}
        </div>
      </section>

      {contextMenu && (
        <NoteContextMenu
          note={contextMenu.note}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onTogglePin={handleTogglePin}
          onArchive={handleArchive}
          onTrash={handleTrash}
          onRestoreFromTrash={handleRestoreTrash}
          onDeletePermanently={handleDeletePermanently}
          folders={folders}
          onMoveToFolder={(note, folderId) => {
            handleMoveNoteToFolder(note.id, folderId).catch((error) =>
              window.alert(
                error instanceof Error ? error.message : "Could not move note.",
              ),
            );
          }}
        />
      )}
    </main>
  );
}
