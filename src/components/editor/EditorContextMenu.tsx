"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  CheckSquare,
  Code,
  Copy,
  Eraser,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Scissors,
  Strikethrough,
  Trash2,
  Underline,
} from "lucide-react";

type EditorContextMenuProps = {
  editor: Editor;
  x: number;
  y: number;
  onClose: () => void;
};

const SCREEN_PADDING = 8;

const menuItemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm " +
  "text-[var(--foreground)] transition-colors " +
  "hover:bg-[var(--hover)] focus-visible:bg-[var(--hover)] " +
  "focus-visible:outline-none";

// Red that works on light and dark themes (transparent tint for hover)
const dangerItemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm " +
  "text-red-500 transition-colors " +
  "hover:bg-[color-mix(in_srgb,#ef4444_14%,transparent)] " +
  "focus-visible:bg-[color-mix(in_srgb,#ef4444_14%,transparent)] " +
  "focus-visible:outline-none";

const dividerClass = "my-1 border-t border-[var(--border)]";

export default function EditorContextMenu({
  editor,
  x,
  y,
  onClose,
}: EditorContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  /*
   * Measure the real menu size and keep it fully on screen.
   * - If it would run past the bottom, flip it above the cursor.
   * - Then clamp to the window so it never goes off any edge.
   * Runs before paint, so the menu never visibly jumps.
   */
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const { width, height } = menu.getBoundingClientRect();

    let top = y;

    if (y + height > window.innerHeight - SCREEN_PADDING) {
      top = y - height;
    }

    top = Math.max(
      SCREEN_PADDING,
      Math.min(top, window.innerHeight - height - SCREEN_PADDING),
    );

    const left = Math.max(
      SCREEN_PADDING,
      Math.min(x, window.innerWidth - width - SCREEN_PADDING),
    );

    setPosition({ left, top });
  }, [x, y]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function run(action: () => void) {
    action();
    onClose();
  }

  async function copySelection(): Promise<boolean> {
    const { from, to, empty } = editor.state.selection;

    if (empty) return false;

    const text = editor.state.doc.textBetween(from, to, "\n");

    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Unable to copy selection:", error);
      return false;
    }
  }

  async function handleCopy() {
    await copySelection();
    onClose();
  }

  async function handleCut() {
    const { empty } = editor.state.selection;
    if (empty) {
      onClose();
      return;
    }

    const copied = await copySelection();

    // Do not remove content if copying failed.
    if (copied && !editor.isDestroyed) {
      editor.chain().focus().deleteSelection().run();
    }

    onClose();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close editor context menu"
        className="fixed inset-0 z-[99] cursor-default"
        onClick={onClose}
      />

      <div
        ref={menuRef}
        role="menu"
        aria-label="Editor formatting menu"
        className="fixed z-[100] w-60 overflow-y-auto rounded-xl border
          border-[var(--border)] bg-[var(--surface)] p-1.5
          text-[var(--foreground)] shadow-2xl"
        style={{
          left: position.left,
          top: position.top,
          // If the window is very short, scroll instead of cutting items off
          maxHeight: `calc(100vh - ${SCREEN_PADDING * 2}px)`,
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleBold().run())
          }
          className={menuItemClass}
        >
          <Bold className="h-4 w-4" />
          Bold
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleItalic().run())
          }
          className={menuItemClass}
        >
          <Italic className="h-4 w-4" />
          Italic
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleUnderline().run())
          }
          className={menuItemClass}
        >
          <Underline className="h-4 w-4" />
          Underline
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleStrike().run())
          }
          className={menuItemClass}
        >
          <Strikethrough className="h-4 w-4" />
          Strike
        </button>

        <div className={dividerClass} />

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleBulletList().run())
          }
          className={menuItemClass}
        >
          <List className="h-4 w-4" />
          Bullet list
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleOrderedList().run())
          }
          className={menuItemClass}
        >
          <ListOrdered className="h-4 w-4" />
          Ordered list
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleTaskList().run())
          }
          className={menuItemClass}
        >
          <CheckSquare className="h-4 w-4" />
          Checklist
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleCode().run())
          }
          className={menuItemClass}
        >
          <Code className="h-4 w-4" />
          Inline code
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().toggleHighlight().run())
          }
          className={menuItemClass}
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </button>

        <div className={dividerClass} />

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run(),
            )
          }
          className={menuItemClass}
        >
          <Eraser className="h-4 w-4" />
          Clear formatting
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().setHorizontalRule().run())
          }
          className={menuItemClass}
        >
          <Minus className="h-4 w-4" />
          Insert divider
        </button>

        <div className={dividerClass} />

        <button
          type="button"
          role="menuitem"
          onClick={() => void handleCopy()}
          className={menuItemClass}
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => void handleCut()}
          className={menuItemClass}
        >
          <Scissors className="h-4 w-4" />
          Cut
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => editor.chain().focus().deleteSelection().run())
          }
          className={dangerItemClass}
        >
          <Trash2 className="h-4 w-4" />
          Delete selection
        </button>
      </div>
    </>
  );
}