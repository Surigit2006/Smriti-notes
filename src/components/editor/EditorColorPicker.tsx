"use client";

import type { Editor } from "@tiptap/react";
import type { SelectionFormatting } from "./getSelectionFormatting";

import { EditorDropdown, EditorDropdownItem } from "./EditorDropdown";
import { Check } from "lucide-react";

interface EditorColorPickerProps {
  editor: Editor;
  formatting: SelectionFormatting;
}

/**
 * Mid-tone colors on purpose: very dark colors (like near-black) vanish on
 * dark themes and very light ones vanish on light themes. These all keep
 * readable contrast on both. "Default" follows the theme's text color.
 *
 * Ordered by hue: neutrals → warm → green → cool → purple/pink → earth.
 */
const COLORS = [
  // Neutrals
  { name: "Gray", value: "#6b7280" },
  { name: "Slate", value: "#64748b" },
  { name: "Stone", value: "#78716c" },

  // Reds & oranges
  { name: "Red", value: "#ef4444" },
  { name: "Coral", value: "#ff6b4a" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#d97706" },
  { name: "Gold", value: "#ca8a04" },
  { name: "Yellow", value: "#eab308" },

  // Greens
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },

  // Blues
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },

  // Purples & pinks
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Magenta", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },

  // Earth
  { name: "Brown", value: "#b9743a" },
  { name: "Olive", value: "#8a9a2b" },
  { name: "Copper", value: "#d2691e" },
];

/**
 * Browsers may report a color as hex or as rgb(...), so compare by the
 * actual red/green/blue numbers.
 */
function normalize(color: string) {
  const c = color.trim().toLowerCase();

  if (c.startsWith("#")) {
    const hex =
      c.length === 4
        ? c
            .slice(1)
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : c.slice(1);

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `${r},${g},${b}`;
  }

  const numbers = c.match(/[\d.]+/g);
  return numbers ? numbers.slice(0, 3).map((n) => String(Number(n))).join(",") : c;
}

export default function EditorColorPicker({
  editor,
  formatting,
}: EditorColorPickerProps) {
  const value = formatting.textColor ?? "";
  const currentColor = value.trim() || "var(--foreground)";

  const activeColor = COLORS.find(
    (color) => value && normalize(color.value) === normalize(value),
  );

  function handleChange(newValue: string) {
    if (!newValue) {
      editor.chain().focus().unsetColor().run();
      return;
    }

    editor.chain().focus().setColor(newValue).run();
  }

  return (
    <EditorDropdown
      triggerClassName="!gap-0 !px-1"
      label="Text color"
      width={248}
      trigger={
        <div className="relative flex h-9 w-9 items-center justify-center">
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00cfff, #0044ff, #aa00ff, #ff0088, #ff0000)",
            }}
          >
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: currentColor }}
            />
          </div>
        </div>
      }
    >
      {(close) => (
        <>
          <div className="px-2.5 pb-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Text color
            </span>
          </div>

          <EditorDropdownItem
            active={!value}
            onClick={() => {
              handleChange("");
              close();
            }}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-[var(--border)]"
              style={{ backgroundColor: "var(--foreground)" }}
            />
            <span className="flex-1">Default (theme)</span>
            {!value && <Check size={15} />}
          </EditorDropdownItem>

          <div className="my-2 border-t border-[var(--border)]" />

          <div className="grid grid-cols-6 gap-1.5 px-1.5 pb-1.5">
            {COLORS.map((color) => {
              const selected = value
                ? normalize(value) === normalize(color.value)
                : false;

              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={`${color.name} text color`}
                  aria-pressed={selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    handleChange(color.value);
                    close();
                  }}
                  className={`h-8 rounded-full border border-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    selected
                      ? "ring-2 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--surface)]"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>

          <p className="px-2.5 pb-1 text-[11px] text-[var(--muted)]">
            {activeColor ? activeColor.name : value ? "Custom color" : "Pick a color"}
          </p>
        </>
      )}
    </EditorDropdown>
  );
}