"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ArchiveSidebar from "@/components/archive/ArchiveSidebar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import MobileTopBar from "@/components/layout/MobileTopbar";
import NoteEditor from "@/components/notes/NoteEditor";
import { useIsMobile } from "@/hooks/useIsMobile";

import type { LocalNote } from "@/database/dexie";
import {
  permanentlyDeleteLocalNote,
  getArchivedNotes,
  updateLocalNote,
} from "@/database/notes";

const LAST_ARCHIVED_NOTE_KEY = "smriti-last-archived-note";

export default function ArchivePage() {
  const router = useRouter();

  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Phone layout: the sidebar lives in a slide-over drawer
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Leaving phone width closes the drawer
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? null;

  const refreshArchive = useCallback(async () => {
    const archivedNotes = await getArchivedNotes();

    setNotes(archivedNotes);

    setSelectedNoteId((currentId) => {
      if (
        currentId &&
        archivedNotes.some((note) => note.id === currentId)
      ) {
        return currentId;
      }

      const savedNoteId =
        typeof window !== "undefined"
          ? localStorage.getItem(LAST_ARCHIVED_NOTE_KEY)
          : null;

      if (
        savedNoteId &&
        archivedNotes.some((note) => note.id === savedNoteId)
      ) {
        return savedNoteId;
      }

      return archivedNotes[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadArchive() {
      try {
        const archivedNotes = await getArchivedNotes();

        if (cancelled) return;

        setNotes(archivedNotes);

        const savedNoteId = localStorage.getItem(
          LAST_ARCHIVED_NOTE_KEY,
        );

        const savedNoteExists = archivedNotes.some(
          (note) => note.id === savedNoteId,
        );

        setSelectedNoteId(
          savedNoteExists && savedNoteId
            ? savedNoteId
            : archivedNotes[0]?.id ?? null,
        );
      } catch (error) {
        console.error("Failed to load archived notes:", error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadArchive();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedNoteId) {
      localStorage.setItem(
        LAST_ARCHIVED_NOTE_KEY,
        selectedNoteId,
      );
    } else {
      localStorage.removeItem(LAST_ARCHIVED_NOTE_KEY);
    }
  }, [selectedNoteId]);

  // Open an archived note (and close the drawer on phones).
  const handleSelectNote = useCallback((note: LocalNote) => {
    setDrawerOpen(false);
    setSelectedNoteId(note.id);
  }, []);

  const handleChange = useCallback(
    async (
      noteId: string,
      changes: Partial<Omit<LocalNote, "id" | "createdAt">>,
    ) => {
      await updateLocalNote(noteId, changes);

      const now = new Date().toISOString();

      setNotes((current) =>
        current
          .map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  ...changes,
                  updatedAt: now,
                  syncStatus: "pending" as const,
                }
              : note,
          )
          .filter((note) => note.isArchived && !note.isTrashed),
      );

      if (changes.isArchived === false || changes.isTrashed) {
        setSelectedNoteId((current) =>
          current === noteId ? null : current,
        );
      }
    },
    [],
  );

  const handleUnarchive = useCallback(
    async (noteId: string) => {
      try {
        await updateLocalNote(noteId, {
          isArchived: false,
        });

        setNotes((current) =>
          current.filter((note) => note.id !== noteId),
        );

        setSelectedNoteId((current) =>
          current === noteId ? null : current,
        );

        await refreshArchive();
      } catch (error) {
        console.error("Failed to unarchive note:", error);
      }
    },
    [refreshArchive],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      const confirmed = window.confirm(
        "Permanently delete this note? This action cannot be undone.",
      );

      if (!confirmed) return;

      try {
        await permanentlyDeleteLocalNote(noteId);

        setNotes((current) =>
          current.filter((note) => note.id !== noteId),
        );

        setSelectedNoteId((current) =>
          current === noteId ? null : current,
        );

        await refreshArchive();
      } catch (error) {
        console.error("Failed to permanently delete note:", error);
      }
    },
    [refreshArchive],
  );

  // Loading screen (same skeleton as the notes page).
  if (!isHydrated) {
    return (
      <main className="flex h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-background)] md:block">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 h-7 w-32 animate-pulse rounded-md bg-[var(--hover)]" />
            <div className="space-y-3">
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
          <header className="flex h-14 shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
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
    <ArchiveSidebar
      notes={notes}
      selectedNoteId={selectedNoteId}
      onSelectNote={handleSelectNote}
      onBack={() => router.push("/")}
      onUnarchive={handleUnarchive}
      onDelete={handleDelete}
      isMobile={isMobile}
      onClose={closeDrawer}
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
            title={selectedNote?.title?.trim() || "Archive"}
            onOpenMenu={() => setDrawerOpen(true)}
          />
        )}

        <div className="min-h-0 flex-1">
          <NoteEditor
            key={selectedNote?.id ?? "no-note"}
            note={selectedNote}
            onNoteChange={handleChange}
          />
        </div>
      </section>
    </main>
  );
}