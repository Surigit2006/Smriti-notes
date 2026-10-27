"use client";

import type { Editor } from "@tiptap/react";
import { Check, Highlighter } from "lucide-react";

import type { SelectionFormatting } from "./getSelectionFormatting";
import {
  EditorDropdown,
  EditorDropdownItem,
} from "./EditorDropdown";

interface EditorHighlightPickerProps {
  editor: Editor;
  formatting: SelectionFormatting;
}

/**
 * `value`  → semi-transparent color stored in the document. It blends with the
 *            theme background, so text stays readable on light AND dark themes.
 * `swatch` → solid color used only for the picker UI (preview + toolbar bar).
 *
 * Ordered by hue: warm → cool → neutral.
 */
const HIGHLIGHTS = [
  // Yellows & oranges
  { name: "Lemon", value: "rgba(253, 224, 71, 0.45)", swatch: "#fde047" },
  { name: "Yellow", value: "rgba(250, 204, 21, 0.40)", swatch: "#facc15" },
  { name: "Amber", value: "rgba(245, 158, 11, 0.40)", swatch: "#f59e0b" },
  { name: "Orange", value: "rgba(251, 146, 60, 0.40)", swatch: "#fb923c" },
  { name: "Coral", value: "rgba(255, 127, 80, 0.40)", swatch: "#ff7f50" },
  {name: "Bright Yellow", value: "rgba(255, 255, 0, 1.00)", swatch: "#FFFF00"},

  // Reds & pinks
  { name: "Red", value: "rgba(248, 113, 113, 0.38)", swatch: "#f87171" },
  { name: "Crimson", value: "rgba(220, 38, 38, 0.35)", swatch: "#dc2626" },
  { name: "Rose", value: "rgba(251, 113, 133, 0.38)", swatch: "#fb7185" },
  { name: "Pink", value: "rgba(244, 114, 182, 0.38)", swatch: "#f472b6" },
  { name: "Magenta", value: "rgba(217, 70, 239, 0.34)", swatch: "#d946ef" },

  // Purples & blues
  { name: "Purple", value: "rgba(167, 139, 250, 0.40)", swatch: "#a78bfa" },
  { name: "Violet", value: "rgba(139, 92, 246, 0.36)", swatch: "#8b5cf6" },
  { name: "Indigo", value: "rgba(129, 140, 248, 0.40)", swatch: "#818cf8" },
  { name: "Blue", value: "rgba(96, 165, 250, 0.38)", swatch: "#60a5fa" },
  { name: "Sky", value: "rgba(56, 189, 248, 0.38)", swatch: "#38bdf8" },
  { name: "Cyan", value: "rgba(34, 211, 238, 0.36)", swatch: "#22d3ee" },

  // Greens
  { name: "Teal", value: "rgba(45, 212, 191, 0.36)", swatch: "#2dd4bf" },
  { name: "Mint", value: "rgba(110, 231, 183, 0.40)", swatch: "#6ee7b7" },
  { name: "Emerald", value: "rgba(16, 185, 129, 0.36)", swatch: "#10b981" },
  { name: "Green", value: "rgba(74, 222, 128, 0.35)", swatch: "#4ade80" },
  { name: "Lime", value: "rgba(163, 230, 53, 0.40)", swatch: "#a3e635" },
  { name: "Olive", value: "rgba(154, 160, 60, 0.42)", swatch: "#9aa03c" },

  // Earth & neutrals
  { name: "Brown", value: "rgba(180, 120, 80, 0.40)", swatch: "#b47850" },
  { name: "Sand", value: "rgba(214, 190, 150, 0.50)", swatch: "#d6be96" },
  { name: "Gray", value: "rgba(148, 163, 184, 0.40)", swatch: "#94a3b8" },
  { name: "Slate", value: "rgba(100, 116, 139, 0.42)", swatch: "#64748b" },
  { name: "Charcoal", value: "rgba(71, 85, 105, 0.50)", swatch: "#475569" },
];

const DEFAULT_SWATCH = "#facc15";

/**
 * Browsers re-serialize colors (spacing, 0.40 → 0.4), so compare by the
 * numbers inside the color instead of the raw string.
 */
function normalize(color: string) {
  const numbers = color.match(/[\d.]+/g);

  if (!numbers) return color.trim().toLowerCase();

  return numbers.map((n) => String(Number(n))).join(",");
}

export default function EditorHighlightPicker({
  editor,
  formatting,
}: EditorHighlightPickerProps) {
  const value = formatting.highlightColor ?? "";

  const activeHighlight = HIGHLIGHTS.find(
    (highlight) => value && normalize(highlight.value) === normalize(value),
  );

  // Solid color for the little bar under the toolbar icon
  const indicatorColor = activeHighlight?.swatch || DEFAULT_SWATCH;

  function handleChange(newValue: string) {
    if (!newValue) {
      editor.chain().focus().unsetHighlight().run();
      return;
    }

    editor.chain().focus().setHighlight({ color: newValue }).run();
  }

  return (
    <EditorDropdown
      triggerClassName="!gap-0 !px-1"
      label="Highlight color"
      width={248}
      trigger={
        <div className="relative flex h-9 w-10 items-center justify-center">
          <Highlighter
            size={19}
            strokeWidth={1.8}
            className="pointer-events-none text-[var(--foreground)]"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[4px] left-1/2 h-[4px] w-5 -translate-x-1/2 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: indicatorColor }}
          />
        </div>
      }
    >
      {(close) => (
        <>
          <div className="px-2.5 pb-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Highlight color
            </span>
          </div>

          <EditorDropdownItem
            active={!value}
            onClick={() => {
              handleChange("");
              close();
            }}
          >
            <span className="flex-1">No highlight</span>
            {!value && <Check size={15} />}
          </EditorDropdownItem>

          <div className="my-1.5 border-t border-[var(--border)]" />

          <div className="grid grid-cols-6 gap-1.5 px-1.5 pb-1.5">
            {HIGHLIGHTS.map((item) => {
              const selected = value
                ? normalize(value) === normalize(item.value)
                : false;

              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  aria-label={`${item.name} highlight`}
                  aria-pressed={selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    handleChange(item.value);
                    close();
                  }}
                  className={`h-8 rounded-md border border-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    selected
                      ? "ring-2 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--surface)]"
                      : ""
                  }`}
                  style={{ backgroundColor: item.swatch }}
                />
              );
            })}
          </div>

          <p className="px-2.5 pb-1 text-[11px] text-[var(--muted)]">
            {activeHighlight ? activeHighlight.name : "Pick a color"}
          </p>
        </>
      )}
    </EditorDropdown>
  );
}