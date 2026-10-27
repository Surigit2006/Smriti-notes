"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heading,
  Merge,
  Split,
  Trash2,
} from "lucide-react";

import { TableColorPicker } from "./EditorMoreMenu";
import { canSplitPlainCell, splitPlainCell } from "./TableSplit";

interface TableContextMenuProps {
  editor: Editor;
}

/** A multi-cell selection (drag across cells) is a ProseMirror CellSelection. */
function isCellSelection(editor: Editor) {
  return "$anchorCell" in editor.state.selection;
}

/** Table checks throw a RangeError when the selection is stale; treat that as "no". */
function safe(check: () => boolean): boolean {
  try {
    return check();
  } catch {
    return false;
  }
}

function Item({
  children,
  onClick,
  danger = false,
  disabled = false,
  hint,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? hint : undefined}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-[var(--muted)] opacity-50"
          : danger
            ? "text-red-500 hover:bg-[color-mix(in_srgb,#ef4444_14%,transparent)]"
            : "text-[var(--foreground)] hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
      {children}
    </p>
  );
}

export default function TableContextMenu({ editor }: TableContextMenuProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  // Computed once when the menu opens (not during render), so a stale
  // selection can never throw while React is rendering.
  const [flags, setFlags] = useState({
    canMerge: false,
    canUnmerge: false,
    canSplitPlain: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * Open on right-click inside a table cell.
   *
   * Important: a right-click normally collapses a multi-cell selection down
   * to a single caret BEFORE the contextmenu event fires, which is why
   * "Merge cells" had nothing to merge. The capture-phase mousedown below
   * blocks that when the click lands inside the selected cells.
   */
  useEffect(() => {
    const dom = editor.view.dom;

    function onMouseDown(event: MouseEvent) {
      if (event.button !== 2) return;

      const cell = (event.target as HTMLElement | null)?.closest("td, th");
      if (!cell || !dom.contains(cell)) return;

      if (isCellSelection(editor) && cell.classList.contains("selectedCell")) {
        // Keep the multi-cell selection intact
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function onContextMenu(event: MouseEvent) {
      const cell = (event.target as HTMLElement | null)?.closest("td, th");
      if (!cell || !dom.contains(cell)) return;

      event.preventDefault();

      // Keep a multi-cell selection if the click is inside it;
      // otherwise move the cursor into the clicked cell.
      const keepSelection =
        isCellSelection(editor) && cell.classList.contains("selectedCell");

      if (!keepSelection) {
        const coords = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (coords) {
          try {
            editor.chain().focus().setTextSelection(coords.pos).run();
          } catch {
            /* stale position: keep the current selection */
          }
        }
      }

      setFlags({
        canMerge: safe(() => editor.can().mergeCells()),
        canUnmerge: safe(() => editor.can().splitCell()),
        canSplitPlain: safe(() => canSplitPlainCell(editor)),
      });

      setPoint({ x: event.clientX, y: event.clientY });
    }

    dom.addEventListener("mousedown", onMouseDown, true);
    dom.addEventListener("contextmenu", onContextMenu);

    return () => {
      dom.removeEventListener("mousedown", onMouseDown, true);
      dom.removeEventListener("contextmenu", onContextMenu);
    };
  }, [editor]);

  /* Close on outside click, Escape, scroll or resize */
  useEffect(() => {
    if (!point) return;

    const close = () => setPoint(null);

    function onMouseDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      close();
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [point]);

  /* Keep the menu fully on screen (flip up if it would pass the bottom) */
  useLayoutEffect(() => {
    if (!point || !menuRef.current) return;

    const margin = 8;
    const rect = menuRef.current.getBoundingClientRect();

    let top = point.y;
    if (point.y + rect.height > window.innerHeight - margin) {
      top = point.y - rect.height;
    }
    top = Math.max(
      margin,
      Math.min(top, window.innerHeight - rect.height - margin),
    );

    const left = Math.max(
      margin,
      Math.min(point.x, window.innerWidth - rect.width - margin),
    );

    menuRef.current.style.left = `${left}px`;
    menuRef.current.style.top = `${top}px`;
  }, [point]);

  if (!point) return null;

  function run(command: () => void) {
    try {
      command();
    } catch (error) {
      console.warn("Table command failed", error);
    } finally {
      setPoint(null);
    }
  }

  // Merge only works with 2+ selected cells; split only on a merged cell
  const { canMerge, canUnmerge, canSplitPlain } = flags;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: point.x,
        top: point.y,
        zIndex: 99999,
        maxHeight: "calc(100vh - 16px)",
      }}
      className="w-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--foreground)] shadow-2xl shadow-black/15"
      onContextMenu={(event) => event.preventDefault()}
    >
      <Label>Rows & columns</Label>

      <Item onClick={() => run(() => editor.chain().focus().addRowBefore().run())}>
        <ArrowUp size={15} className="text-[var(--muted)]" />
        Insert row above
      </Item>
      <Item onClick={() => run(() => editor.chain().focus().addRowAfter().run())}>
        <ArrowDown size={15} className="text-[var(--muted)]" />
        Insert row below
      </Item>
      <Item onClick={() => run(() => editor.chain().focus().addColumnBefore().run())}>
        <ArrowLeft size={15} className="text-[var(--muted)]" />
        Insert column left
      </Item>
      <Item onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}>
        <ArrowRight size={15} className="text-[var(--muted)]" />
        Insert column right
      </Item>
      <Item onClick={() => run(() => editor.chain().focus().toggleHeaderRow().run())}>
        <Heading size={15} className="text-[var(--muted)]" />
        Toggle header row
      </Item>

      <div className="my-1.5 border-t border-[var(--border)]" />

      <Item
        disabled={!canMerge}
        hint="Drag across two or more cells first"
        onClick={() => run(() => editor.chain().focus().mergeCells().run())}
      >
        <Merge size={15} className="text-[var(--muted)]" />
        Merge cells
      </Item>
      <Item
        disabled={!canSplitPlain}
        hint="Click inside a single, unmerged cell"
        onClick={() => run(() => splitPlainCell(editor, "columns"))}
      >
        <Split size={15} className="text-[var(--muted)]" />
        Split into 2 columns
      </Item>
      <Item
        disabled={!canSplitPlain}
        hint="Click inside a single, unmerged cell"
        onClick={() => run(() => splitPlainCell(editor, "rows"))}
      >
        <Split size={15} className="rotate-90 text-[var(--muted)]" />
        Split into 2 rows
      </Item>
      <Item
        disabled={!canUnmerge}
        hint="Only works on a merged cell"
        onClick={() => run(() => editor.chain().focus().splitCell().run())}
      >
        <Split size={15} className="text-[var(--muted)]" />
        Unmerge cell
      </Item>

      <div className="my-1.5 border-t border-[var(--border)]" />

      <Label>Background color</Label>
      <TableColorPicker editor={editor} />

      <div className="my-1.5 border-t border-[var(--border)]" />

      <Item danger onClick={() => run(() => editor.chain().focus().deleteRow().run())}>
        <Trash2 size={15} />
        Delete row
      </Item>
      <Item danger onClick={() => run(() => editor.chain().focus().deleteColumn().run())}>
        <Trash2 size={15} />
        Delete column
      </Item>
      <Item danger onClick={() => run(() => editor.chain().focus().deleteTable().run())}>
        <Trash2 size={15} />
        Delete table
      </Item>
    </div>,
    document.body,
  );
}