
import Dexie, { type Table } from "dexie";

export interface LocalNote {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
  trashedAt: string | null;
  syncStatus: "synced" | "pending";
}

export interface LocalFolder {
  id: string;
  name: string;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: "synced" | "pending";
}

class SmritiDatabase extends Dexie {
  notes!: Table<LocalNote, string>;
  folders!: Table<LocalFolder, string>;

  constructor() {
    super("SmritiDatabase");

    // Version 1: Initial notes database.
    this.version(1).stores({
      notes:
        "id, folderId, isPinned, isArchived, isTrashed, updatedAt, syncStatus",
    });

    // Version 2: Recently opened notes.
    this.version(2).stores({
      notes:
        "id, folderId, isPinned, isArchived, isTrashed, updatedAt, lastOpenedAt, syncStatus",
    });

    // Version 3: Persistent folders.
    this.version(3).stores({
      notes:
        "id, folderId, isPinned, isArchived, isTrashed, updatedAt, lastOpenedAt, syncStatus",
      folders: "id, name, isArchived, isTrashed, updatedAt",
    });
  }
}

export const db = new SmritiDatabase();
