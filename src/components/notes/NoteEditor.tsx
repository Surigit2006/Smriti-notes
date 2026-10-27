"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { FileText, CloudOff } from "lucide-react";

import type { LocalNote } from "@/database/dexie";

import EditorContextMenu from "@/components/editor/EditorContextMenu";
import EditorSaveStatus, {
  type SaveStatus,
} from "@/components/editor/EditorSaveStatus";
import EditorToolbar from "@/components/editor/EditorToolbar";
import TableContextMenu from "@/components/editor/TableContextMenu";
import { editorExtensions } from "@/components/editor/EditorExtensions";

type NoteEditorProps = {
  note: LocalNote | null;
  onNoteChange: (
    noteId: string,
    changes: Partial<Omit<LocalNote, "id" | "createdAt">>,
  ) => void | Promise<void>;
};

type PendingChanges = {
  title?: string;
  content?: string;
};

type ContextMenuState = {
  x: number;
  y: number;
};

export default function NoteEditor({ note, onNoteChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isOnline, setIsOnline] = useState(true);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const activeNoteIdRef = useRef(note?.id ?? null);
  const onNoteChangeRef = useRef(onNoteChange);

  const pendingChangesRef = useRef<Map<string, PendingChanges>>(new Map());

  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    onNoteChangeRef.current = onNoteChange;
  }, [onNoteChange]);

  useEffect(() => {
    activeNoteIdRef.current = note?.id ?? null;
  }, [note?.id]);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setSaveStatus("saved");
    setContextMenu(null);
  }, [note?.id, note?.title]);

  const flushSave = useCallback(async (noteId: string) => {
    const pending = pendingChangesRef.current.get(noteId);

    if (!pending) return;

    pendingChangesRef.current.delete(noteId);

    const timer = saveTimersRef.current.get(noteId);

    if (timer) {
      clearTimeout(timer);
      saveTimersRef.current.delete(noteId);
    }

    setSaveStatus("saving");

    try {
      await onNoteChangeRef.current(noteId, pending);
      setSaveStatus("saved");
    } catch {
      const current = pendingChangesRef.current.get(noteId) ?? {};

      pendingChangesRef.current.set(noteId, {
        ...pending,
        ...current,
      });

      setSaveStatus("error");
    }
  }, []);

  const scheduleSave = useCallback(
    (noteId: string) => {
      const existingTimer = saveTimersRef.current.get(noteId);

      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        void flushSave(noteId);
      }, 500);

      saveTimersRef.current.set(noteId, timer);
      setSaveStatus("saving");
    },
    [flushSave],
  );

  const editor = useEditor(
    {
      extensions: editorExtensions,
      content: "",
      immediatelyRender: false,

      editorProps: {
        attributes: {
          class:
            "smriti-editor-content min-h-full max-w-none outline-none focus:outline-none",
          spellcheck: "true",
        },
      },

      onUpdate({ editor: currentEditor }) {
        const id = activeNoteIdRef.current;
        if (!id) return;

        const content = currentEditor.getHTML();
        const current = pendingChangesRef.current.get(id) ?? {};

        pendingChangesRef.current.set(id, {
          ...current,
          content,
        });

        scheduleSave(id);
      },
    },
    [note?.id, scheduleSave],
  );

  useEffect(() => {
    if (!editor || !note) return;

    const savedContent = note.content ?? "";

    if (editor.getHTML() === savedContent) return;

    let cancelled = false;

    // Code blocks render through a React node view, which uses flushSync.
    // React forbids that inside an effect, so run it right after the effect.
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed) return;

      editor.commands.setContent(savedContent, {
        emitUpdate: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [editor, note]);

  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null);

    window.addEventListener("mousedown", handleWindowClick);

    return () => {
      window.removeEventListener("mousedown", handleWindowClick);
    };
  }, []);

  useEffect(() => {
    const timers = saveTimersRef.current;
    const pending = pendingChangesRef.current;

    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }

      timers.clear();

      const pendingToFlush = new Map(pending);
      pending.clear();

      for (const [noteId, changes] of pendingToFlush) {
        void onNoteChangeRef.current(noteId, changes);
      }
    };
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);

    const id = activeNoteIdRef.current;
    if (!id) return;

    const current = pendingChangesRef.current.get(id) ?? {};

    pendingChangesRef.current.set(id, {
      ...current,
      title: value,
    });

    scheduleSave(id);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    // Table cells have their own right-click menu (TableContextMenu)
    if ((event.target as HTMLElement).closest("td, th")) return;

    // Touch screens: keep the native long-press (text selection, copy/paste)
    if (window.matchMedia("(hover: none)").matches) return;

    event.preventDefault();

    if (!editor) return;

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }

  if (!note) {
    return (
      <section className="flex h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)]">
              <FileText className="h-6 w-6 text-[var(--muted)]" />
            </div>

            <div>
              <h2 className="text-sm font-medium text-[var(--foreground)]">
                No note selected
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Select a note to start writing.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-full min-w-0 flex-col bg-[var(--background)] text-[var(--foreground)]">
      {editor && <EditorToolbar editor={editor} />}

      <div
        className="relative flex-1 overflow-y-auto bg-[var(--background)]"
        onContextMenu={handleContextMenu}
      >
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10 md:px-12 lg:px-16">
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Untitled Note"
            className="mb-4 w-full border-0 bg-transparent text-2xl font-semibold tracking-tight text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:mb-6 sm:text-4xl"
          />

          {editor && (
            <EditorContent
              editor={editor}
              className="min-h-[300px] text-[16px] leading-7 text-[var(--foreground)] sm:min-h-[500px]"
            />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-40 sm:bottom-5 sm:right-5">
        {isOnline ? (
          <EditorSaveStatus status={saveStatus} />
        ) : (
          <div
            className="flex items-center justify-center p-1.5 text-muted-foreground"
            role="status"
            aria-label="Offline"
            title="Offline — changes stay on this device until sync is available"
          >
            <CloudOff className="h-5 w-5" strokeWidth={2.1} />
          </div>
        )}
      </div>

      {editor && contextMenu && (
        <EditorContextMenu
          editor={editor}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Right-click menu for table cells */}
      {editor && <TableContextMenu editor={editor} />}
    </section>
  );
}
