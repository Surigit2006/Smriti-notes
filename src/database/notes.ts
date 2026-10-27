
import { db } from "@/database/dexie";
import type { LocalFolder, LocalNote } from "@/database/dexie";

type NoteChanges = Partial<
  Pick<
    LocalNote,
    | "title"
    | "content"
    | "folderId"
    | "isPinned"
    | "isArchived"
    | "isTrashed"
    | "lastOpenedAt"
    | "trashedAt"
  >
>;

function now(): string {
  return new Date().toISOString();
}

function sortNewest<T extends { updatedAt?: string; createdAt?: string }>(
  items: T[],
): T[] {
  return items.sort((a, b) => {
    const aDate = a.updatedAt ?? a.createdAt ?? "";
    const bDate = b.updatedAt ?? b.createdAt ?? "";
    return bDate.localeCompare(aDate);
  });
}

async function requireNote(id: string): Promise<LocalNote> {
  const note = await db.notes.get(id);
  if (!note) throw new Error(`Note not found: ${id}`);
  return note;
}

async function requireFolder(id: string): Promise<LocalFolder> {
  const folder = await db.folders.get(id);
  if (!folder) throw new Error(`Folder not found: ${id}`);
  return folder;
}

/* -------------------------------------------------------------------------- */
/* Notes                                                                       */
/* -------------------------------------------------------------------------- */

export async function createLocalNote(
  title = "",
  content = "",
  folderId: string | null = null,
): Promise<LocalNote> {
  if (folderId !== null) {
    const folder = await requireFolder(folderId);
    if (folder.isArchived || folder.isTrashed) {
      throw new Error("Cannot create a note in an archived or trashed folder.");
    }
  }

  const timestamp = now();

  const note: LocalNote = {
    id: crypto.randomUUID(),
    folderId,
    title,
    content,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    trashedAt: null,
    syncStatus: "pending",
  };

  await db.notes.add(note);
  return note;
}

export async function getLocalNotes(): Promise<LocalNote[]> {
  const notes = await db.notes.toArray();

  return notes
    .filter((note) => !note.isTrashed && !note.isArchived)
    .sort((a, b) => {
      const aDate = a.lastOpenedAt ?? a.updatedAt ?? a.createdAt;
      const bDate = b.lastOpenedAt ?? b.updatedAt ?? b.createdAt;
      return bDate.localeCompare(aDate);
    });
}

export async function getLocalNote(
  id: string,
): Promise<LocalNote | undefined> {
  return db.notes.get(id);
}

export async function updateLocalNote(
  id: string,
  changes: NoteChanges,
): Promise<void> {
  const existing = await requireNote(id);

  if (existing.isTrashed && changes.isTrashed !== false) {
    throw new Error("Restore the note before editing it.");
  }

  if (changes.folderId) {
    const folder = await requireFolder(changes.folderId);
    if (folder.isArchived || folder.isTrashed) {
      throw new Error("Cannot move a note into an archived or trashed folder.");
    }
  }

  await db.notes.update(id, {
    ...changes,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function openLocalNote(id: string): Promise<LocalNote> {
  const note = await requireNote(id);

  if (note.isTrashed || note.isArchived) {
    throw new Error("This note is not available in the notes view.");
  }

  const lastOpenedAt = now();

  await db.notes.update(id, {
    lastOpenedAt,
    updatedAt: note.updatedAt,
  });

  return { ...note, lastOpenedAt };
}

export async function getRecentlyOpenedNotes(): Promise<LocalNote[]> {
  const notes = await getLocalNotes();

  return notes
    .filter((note) => note.lastOpenedAt !== null)
    .sort((a, b) =>
      (b.lastOpenedAt ?? "").localeCompare(a.lastOpenedAt ?? ""),
    );
}

export async function getPinnedNotes(): Promise<LocalNote[]> {
  const notes = await getLocalNotes();
  return notes.filter((note) => note.isPinned);
}

export async function togglePinLocalNote(id: string): Promise<void> {
  const note = await requireNote(id);

  if (note.isTrashed || note.isArchived) {
    throw new Error("Restore the note before pinning it.");
  }

  await db.notes.update(id, {
    isPinned: !note.isPinned,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function archiveLocalNote(id: string): Promise<void> {
  const note = await requireNote(id);
  if (note.isTrashed) throw new Error("Restore the note before archiving it.");

  await db.notes.update(id, {
    isArchived: true,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function restoreLocalNoteFromArchive(
  id: string,
): Promise<void> {
  const note = await requireNote(id);
  if (note.isTrashed) throw new Error("Restore the note from Trash first.");

  await db.notes.update(id, {
    isArchived: false,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function getArchivedNotes(): Promise<LocalNote[]> {
  const notes = await db.notes.toArray();
  return sortNewest(
    notes.filter((note) => note.isArchived && !note.isTrashed),
  );
}

export async function trashLocalNote(id: string): Promise<void> {
  const note = await requireNote(id);
  const timestamp = now();

  await db.notes.update(id, {
    isTrashed: true,
    isArchived: false,
    trashedAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  });
}

export async function getTrashedNotes(): Promise<LocalNote[]> {
  const notes = await db.notes.toArray();
  return sortNewest(notes.filter((note) => note.isTrashed));
}

export async function restoreLocalNoteFromTrash(
  id: string,
): Promise<void> {
  const note = await requireNote(id);

  await db.notes.update(id, {
    isTrashed: false,
    isArchived: false,
    trashedAt: null,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function permanentlyDeleteLocalNote(
  id: string,
): Promise<void> {
  await db.notes.delete(id);
}

export async function moveLocalNoteToFolder(
  noteId: string,
  folderId: string | null,
): Promise<void> {
  const note = await requireNote(noteId);

  if (note.isTrashed || note.isArchived) {
    throw new Error("Only active notes can be moved.");
  }

  if (folderId !== null) {
    const folder = await requireFolder(folderId);
    if (folder.isArchived || folder.isTrashed) {
      throw new Error("Cannot move a note into an archived or trashed folder.");
    }
  }

  await updateLocalNote(noteId, { folderId });
}

export async function getNotesInFolder(
  folderId: string,
): Promise<LocalNote[]> {
  const notes = await getLocalNotes();
  return notes.filter((note) => note.folderId === folderId);
}

/* -------------------------------------------------------------------------- */
/* Folders                                                                     */
/* -------------------------------------------------------------------------- */

export async function createLocalFolder(
  name: string,
): Promise<LocalFolder> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Folder name cannot be empty.");

  const existingFolders = await getLocalFolders();
  if (
    existingFolders.some(
      (folder) => folder.name.toLowerCase() === trimmedName.toLowerCase(),
    )
  ) {
    throw new Error("A folder with this name already exists.");
  }

  const timestamp = now();

  const folder: LocalFolder = {
    id: crypto.randomUUID(),
    name: trimmedName,
    createdAt: timestamp,
    updatedAt: timestamp,
    isArchived: false,
    isTrashed: false,
    syncStatus: "pending",
  };

  await db.folders.add(folder);
  return folder;
}

export async function getLocalFolders(): Promise<LocalFolder[]> {
  const folders = await db.folders.toArray();

  return sortNewest(
    folders.filter((folder) => !folder.isArchived && !folder.isTrashed),
  );
}

export async function renameLocalFolder(
  id: string,
  name: string,
): Promise<void> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Folder name cannot be empty.");

  const folder = await requireFolder(id);
  if (folder.isArchived || folder.isTrashed) {
    throw new Error("Restore the folder before renaming it.");
  }

  const folders = await getLocalFolders();
  if (
    folders.some(
      (item) =>
        item.id !== id &&
        item.name.toLowerCase() === trimmedName.toLowerCase(),
    )
  ) {
    throw new Error("A folder with this name already exists.");
  }

  await db.folders.update(id, {
    name: trimmedName,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteLocalFolder(id: string): Promise<void> {
  await requireFolder(id);

  await db.transaction("rw", db.notes, db.folders, async () => {
    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      await db.notes.update(note.id, {
        folderId: null,
        updatedAt: now(),
        syncStatus: "pending",
      });
    }

    await db.folders.delete(id);
  });
}

export async function archiveLocalFolder(id: string): Promise<void> {
  const folder = await requireFolder(id);
  if (folder.isTrashed) throw new Error("Restore the folder from Trash first.");

  const timestamp = now();

  await db.transaction("rw", db.notes, db.folders, async () => {
    await db.folders.update(id, {
      isArchived: true,
      updatedAt: timestamp,
      syncStatus: "pending",
    });

    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      if (!note.isTrashed) {
        await db.notes.update(note.id, {
          isArchived: true,
          updatedAt: timestamp,
          syncStatus: "pending",
        });
      }
    }
  });
}

export async function trashLocalFolder(id: string): Promise<void> {
  await requireFolder(id);

  const timestamp = now();

  await db.transaction("rw", db.notes, db.folders, async () => {
    await db.folders.update(id, {
      isTrashed: true,
      isArchived: false,
      updatedAt: timestamp,
      syncStatus: "pending",
    });

    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      await db.notes.update(note.id, {
        isTrashed: true,
        isArchived: false,
        trashedAt: timestamp,
        updatedAt: timestamp,
        syncStatus: "pending",
      });
    }
  });
}

export async function getArchivedFolders(): Promise<LocalFolder[]> {
  const folders = await db.folders.toArray();
  return sortNewest(
    folders.filter((folder) => folder.isArchived && !folder.isTrashed),
  );
}

export async function getTrashedFolders(): Promise<LocalFolder[]> {
  const folders = await db.folders.toArray();
  return sortNewest(folders.filter((folder) => folder.isTrashed));
}

export async function restoreLocalFolderFromArchive(
  id: string,
): Promise<void> {
  const folder = await requireFolder(id);
  if (folder.isTrashed) throw new Error("Restore the folder from Trash first.");

  await db.transaction("rw", db.notes, db.folders, async () => {
    await db.folders.update(id, {
      isArchived: false,
      updatedAt: now(),
      syncStatus: "pending",
    });

    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      if (!note.isTrashed) {
        await db.notes.update(note.id, {
          isArchived: false,
          updatedAt: now(),
          syncStatus: "pending",
        });
      }
    }
  });
}

export async function restoreLocalFolderFromTrash(
  id: string,
): Promise<void> {
  await requireFolder(id);

  await db.transaction("rw", db.notes, db.folders, async () => {
    await db.folders.update(id, {
      isTrashed: false,
      isArchived: false,
      updatedAt: now(),
      syncStatus: "pending",
    });

    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      await db.notes.update(note.id, {
        isTrashed: false,
        isArchived: false,
        trashedAt: null,
        updatedAt: now(),
        syncStatus: "pending",
      });
    }
  });
}

export async function permanentlyDeleteLocalFolder(
  id: string,
): Promise<void> {
  await db.transaction("rw", db.notes, db.folders, async () => {
    const notes = await db.notes.where("folderId").equals(id).toArray();

    for (const note of notes) {
      await db.notes.delete(note.id);
    }

    await db.folders.delete(id);
  });
}
