"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";
import { useEditorState, type Editor } from "@tiptap/react";

import {
  Plus,
  Code,
  Superscript,
  Subscript,
  List,
  ListOrdered,
  CheckSquare,
  Pilcrow,
  Code2,
  Minus,
  RemoveFormatting,
  Table,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heading,
  Trash2,
  Merge,
  Split,
  Ban,
  X,
} from "lucide-react";

interface EditorMoreMenuProps {
  editor: Editor;
}

const MAX_ROWS = 100;
const MAX_COLS = 20;

/**
 * Semi-transparent so the colors blend with any theme background
 * and text stays readable on light and dark themes.
 */
const CELL_COLORS = [
  { name: "None", value: "", swatch: "" },
  { name: "Gray", value: "rgba(148, 163, 184, 0.28)", swatch: "#94a3b8" },
  { name: "Yellow", value: "rgba(250, 204, 21, 0.35)", swatch: "#facc15" },
  { name: "Green", value: "rgba(74, 222, 128, 0.32)", swatch: "#4ade80" },
  { name: "Blue", value: "rgba(96, 165, 250, 0.35)", swatch: "#60a5fa" },
  { name: "Purple", value: "rgba(167, 139, 250, 0.35)", swatch: "#a78bfa" },
  { name: "Pink", value: "rgba(244, 114, 182, 0.35)", swatch: "#f472b6" },
  { name: "Orange", value: "rgba(251, 146, 60, 0.35)", swatch: "#fb923c" },
  { name: "Red", value: "rgba(248, 113, 113, 0.35)", swatch: "#f87171" },
];

type BgTarget = "cell" | "row" | "table";

const CELL_TYPES = ["tableCell", "tableHeader"];

/** Sets a background color on the whole table or the current row. */
function setBackgroundOn(
  editor: Editor,
  scope: "row" | "table",
  color: string,
) {
  editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const { $from } = state.selection;
      const targetType = scope === "table" ? "table" : "tableRow";

      let depth = $from.depth;
      while (depth > 0 && $from.node(depth).type.name !== targetType) {
        depth -= 1;
      }
      if (depth === 0) return false;

      const container = $from.node(depth);
      const start = $from.start(depth);

      container.descendants((node, pos) => {
        if (CELL_TYPES.includes(node.type.name)) {
          tr.setNodeMarkup(start + pos, undefined, {
            ...node.attrs,
            backgroundColor: color || null,
          });
        }
      });

      return true;
    })
    .run();
}


function applyBackground(editor: Editor, target: BgTarget, color: string) {
  if (target === "cell") {
    editor
      .chain()
      .focus()
      .setCellAttribute("backgroundColor", color || null)
      .run();
    return;
  }

  setBackgroundOn(editor, target, color);
}

function MenuItem({
  children,
  onClick,
  active = false,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`
        flex w-full items-center gap-3 rounded-lg px-3 py-2.5
        text-sm transition-colors
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        ${
          danger
            ? "text-red-500 hover:bg-[color-mix(in_srgb,#ef4444_14%,transparent)]"
            : active
              ? "bg-[var(--active)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
        }
      `}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
      {children}
    </p>
  );
}

/** Custom size: type any rows × columns. */
function TableSizeForm({
  onInsert,
}: {
  onInsert: (rows: number, cols: number) => void;
}) {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  function clamp(value: string, max: number) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, max);
  }

  function submit() {
    onInsert(clamp(rows, MAX_ROWS), clamp(cols, MAX_COLS));
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="px-3 pb-2">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] text-[var(--muted)]">
          Rows (1–{MAX_ROWS})
          <input
            type="number"
            min={1}
            max={MAX_ROWS}
            inputMode="numeric"
            value={rows}
            onChange={(event) => setRows(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="text-[11px] text-[var(--muted)]">
          Columns (1–{MAX_COLS})
          <input
            type="number"
            min={1}
            max={MAX_COLS}
            inputMode="numeric"
            value={cols}
            onChange={(event) => setCols(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--hover)] active:bg-[var(--active)]"
      >
        <Table size={15} />
        Insert table
      </button>
    </div>
  );
}

/** Background colors for the cell, the row, or the whole table. */
export function TableColorPicker({ editor }: { editor: Editor }) {
  const [target, setTarget] = useState<BgTarget>("cell");

  const targets: { id: BgTarget; label: string }[] = [
    { id: "cell", label: "Cell" },
    { id: "row", label: "Row" },
    { id: "table", label: "Table" },
  ];

  return (
    <div className="px-3 pb-2">
      <div className="mb-2 grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)] p-0.5">
        {targets.map((item) => (
          <button
            key={item.id}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setTarget(item.id)}
            className={`rounded-md py-1 text-xs transition-colors ${
              target === item.id
                ? "bg-[var(--active)] font-medium text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {CELL_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            aria-label={`${color.name} background for ${target}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyBackground(editor, target, color.value)}
            className="flex h-8 items-center justify-center rounded-md border border-[var(--border)] transition-transform hover:scale-105"
            style={color.swatch ? { backgroundColor: color.swatch } : undefined}
          >
            {!color.swatch && <Ban size={14} className="text-[var(--muted)]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EditorMoreMenu({
  editor,
}: EditorMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  // Follows the cursor live, so the menu switches between
  // "insert table" and "edit table" as soon as you enter a table.
  const { inTable } = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      inTable: (() => {
        try {
          return current?.isActive("table") ?? false;
        } catch {
          return false;
        }
      })(),
    }),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleMenu() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setPosition({
        top: Math.min(
          rect.bottom + 12,
          window.innerHeight - 16,
        ),
        left: Math.max(
          8,
          Math.min(
            rect.right - 240,
            window.innerWidth - 248,
          ),
        ),
      });
    }

    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  /** Runs a command and closes the menu. */
  function run(command: () => void) {
    try {
      command();
    } catch (error) {
      console.warn("Editor command failed", error);
    } finally {
      setOpen(false);
    }
  }

  // Only build the menu while open, so isActive() checks never run on every render.
  const menu = !open ? null : (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 99999,
      }}
      className="
        w-60 max-h-[70vh] overflow-y-auto
        rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-2
        text-[var(--foreground)]
      "
    >
      <div className="mb-1 flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          More formatting
        </span>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close formatting menu"
          className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
        >
          <X size={14} />
        </button>
      </div>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleCode().run())
        }
        active={editor.isActive("code")}
      >
        <Code size={16} />
        Inline code
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleSuperscript().run())
        }
        active={editor.isActive("superscript")}
      >
        <Superscript size={16} />
        Superscript
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleSubscript().run())
        }
        active={editor.isActive("subscript")}
      >
        <Subscript size={16} />
        Subscript
      </MenuItem>

      <div className="my-2 border-t border-[var(--border)]" />

      <SectionLabel>Lists</SectionLabel>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleBulletList().run())
        }
        active={editor.isActive("bulletList")}
      >
        <List size={16} />
        Bullet list
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleOrderedList().run())
        }
        active={editor.isActive("orderedList")}
      >
        <ListOrdered size={16} />
        Numbered list
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleTaskList().run())
        }
        active={editor.isActive("taskList")}
      >
        <CheckSquare size={16} />
        Checklist
      </MenuItem>

      <div className="my-2 border-t border-[var(--border)]" />

      <SectionLabel>Blocks</SectionLabel>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleBlockquote().run())
        }
        active={editor.isActive("blockquote")}
      >
        <Pilcrow size={16} />
        Blockquote
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().toggleCodeBlock().run())
        }
        active={editor.isActive("codeBlock")}
      >
        <Code2 size={16} />
        Code block
      </MenuItem>

      <MenuItem
        onClick={() =>
          run(() => editor.chain().focus().setHorizontalRule().run())
        }
      >
        <Minus size={16} />
        Horizontal rule
      </MenuItem>

      <div className="my-2 border-t border-[var(--border)]" />

      {/* ------------------------------ Tables ------------------------------ */}

      <SectionLabel>
        <Table size={12} />
        {inTable ? "Edit table" : "Insert table"}
      </SectionLabel>

      {!inTable ? (
        <TableSizeForm
          onInsert={(rows, cols) =>
            run(() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows, cols, withHeaderRow: true })
                .run(),
            )
          }
        />
      ) : (
        <>
          {/* These keep the menu open so you can make several edits */}
          <MenuItem
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <ArrowUp size={16} />
            Add row above
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <ArrowDown size={16} />
            Add row below
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <ArrowLeft size={16} />
            Add column left
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <ArrowRight size={16} />
            Add column right
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <Heading size={16} />
            Toggle header row
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            <Merge size={16} />
            Merge selected cells
          </MenuItem>

          <MenuItem
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            <Split size={16} />
            Split cell
          </MenuItem>

          <div className="my-2 border-t border-[var(--border)]" />

          <SectionLabel>Background color</SectionLabel>
          <TableColorPicker editor={editor} />

          <div className="my-2 border-t border-[var(--border)]" />

          <MenuItem
            danger
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Trash2 size={16} />
            Delete row
          </MenuItem>

          <MenuItem
            danger
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Trash2 size={16} />
            Delete column
          </MenuItem>

          <MenuItem
            danger
            onClick={() =>
              run(() => editor.chain().focus().deleteTable().run())
            }
          >
            <Trash2 size={16} />
            Delete table
          </MenuItem>
        </>
      )}

      <div className="my-2 border-t border-[var(--border)]" />

      <MenuItem
        onClick={() =>
          run(() =>
            editor
              .chain()
              .focus()
              .clearNodes()
              .unsetAllMarks()
              .run(),
          )
        }
      >
        <RemoveFormatting size={16} />
        Clear formatting
      </MenuItem>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title="More formatting options"
        aria-label="More formatting options"
        aria-expanded={open}
        onClick={toggleMenu}
        className={`
          flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5
          text-[13px] font-medium transition-all duration-200
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[var(--accent)]
          ${
            open
              ? "bg-[var(--active)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
          }
        `}
      >
        {open ? <X size={15} /> : <Plus size={15} />}
        More
      </button>

      {mounted && open && createPortal(menu, document.body)}
    </>
  );
}