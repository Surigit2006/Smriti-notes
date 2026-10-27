"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";

import {
  Bold,
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Pilcrow,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

import EditorFontFamily from "./EditorFontFamily";
import EditorFontSize from "./EditorFontSize";
import EditorColorPicker from "./EditorColorPicker";
import EditorHighlightPicker from "./EditorHighlightPicker";
import AlignmentSwitch from "./AlignmentSwitch";
import EditorMoreMenu from "./EditorMoreMenu";
import { useSelectionFormatting } from "./useSelectionFormatting";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  children: ReactNode;
  active?: boolean;
  title: string;
  onClick: () => void;
}

const toolbarButtonClass =
  "smriti-dock-button inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-40";
function ToolbarButton({
  children,
  active = false,
  title,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`${toolbarButtonClass} ${
        active
          ? "bg-[var(--active)] text-[var(--foreground)]"
          : ""
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      aria-hidden="true"
      className="mx-1 h-5 w-px shrink-0 bg-[var(--border)]"
    />
  );
}

const styleItems = [
  { value: "paragraph", label: "Paragraph", icon: Pilcrow },
  { value: "h1", label: "Heading 1", icon: Heading1 },
  { value: "h2", label: "Heading 2", icon: Heading2 },
  { value: "h3", label: "Heading 3", icon: Heading3 },
  { value: "h4", label: "Heading 4", icon: Heading1 },
  { value: "h5", label: "Heading 5", icon: Heading2 },
  { value: "h6", label: "Heading 6", icon: Heading3 },
] as const;

export default function EditorToolbar({
  editor,
}: EditorToolbarProps) {
  const formatting = useSelectionFormatting(editor);

  const [, forceUpdate] = useState(0);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => forceUpdate((value) => value + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("focus", update);
    editor.on("blur", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.off("focus", update);
      editor.off("blur", update);
    };
  }, [editor]);

  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 192;
    const menuHeight = 300;
    const gap = 12;

    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - menuWidth - 8),
    );

    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow < menuHeight + gap
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap;

    setMenuPosition({ top, left });
  };

  useEffect(() => {
    if (!styleMenuOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setStyleMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStyleMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [styleMenuOpen]);

  const blockType = formatting.blockType ?? "paragraph";

  const currentStyle =
    styleItems.find((item) => item.value === blockType) ??
    styleItems[0];

  const CurrentIcon = currentStyle.icon;

  const applyBlockStyle = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = Number(value.slice(1)) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;

      editor.chain().focus().setHeading({ level }).run();
    }

    setStyleMenuOpen(false);
  };

  return (
    <div className="smriti-toolbar-track relative z-30 flex w-full shrink-0 justify-center px-3 py-3 text-[var(--foreground)] sm:px-5">
      <div
        className="smriti-mac-toolbar relative flex min-w-0 max-w-full items-center gap-0.5 rounded-full border px-2 py-2"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
      {/* Undo / Redo */}
      <ToolbarButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={16} />
      </ToolbarButton>

      <ToolbarButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      {/* Font family / size */}
      <EditorFontFamily editor={editor} formatting={formatting} />
      <EditorFontSize editor={editor} formatting={formatting} />

      <Divider />

      {/* Basic formatting */}
      <ToolbarButton
        title="Bold"
        active={formatting.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton
        title="Italic"
        active={formatting.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton
        title="Underline"
        active={formatting.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarButton
        title="Strikethrough"
        active={formatting.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <Divider />

      {/* Text color / highlight */}
      <EditorColorPicker editor={editor} formatting={formatting} />
      <EditorHighlightPicker editor={editor} formatting={formatting} />

      <Divider />

      {/* Paragraph / heading dropdown */}
      <button
        ref={triggerRef}
        type="button"
        title={`Text style: ${currentStyle.label}`}
        aria-label={`Text style: ${currentStyle.label}`}
        aria-expanded={styleMenuOpen}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (!styleMenuOpen) updateMenuPosition();
          setStyleMenuOpen((open) => !open);
        }}
        className="smriti-dock-button flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--hover)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <CurrentIcon size={16} />

        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${
            styleMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Portal prevents clipping by the scrollable toolbar */}
      {mounted &&
        styleMenuOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: 192,
              zIndex: 9999,
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow:
                "0 16px 40px -8px rgba(0, 0, 0, 0.28), 0 4px 12px -4px rgba(0, 0, 0, 0.14), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
            }}
            className="smriti-style-menu rounded-2xl border p-1.5 text-[var(--foreground)]"
          >
            {styleItems.map((item) => {
              const Icon = item.icon;
              const selected = blockType === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyBlockStyle(item.value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    selected
                      ? "bg-[var(--active)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>

                  {selected && (
                    <Check
                      size={14}
                      className="text-[var(--accent)]"
                    />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}

      <Divider />

      {/* Alignment */}
      <AlignmentSwitch
        editor={editor}
        alignment={formatting.alignment}
      />

      <Divider />

      {/* More options */}
      <EditorMoreMenu editor={editor} />
      </div>
    </div>
  );
}