"use client";

import type { Editor } from "@tiptap/react";
import type { SelectionFormatting } from "./getSelectionFormatting";

import {
  EditorDropdown,
  EditorDropdownItem,
} from "./EditorDropdown";

interface EditorFontSizeProps {
  editor: Editor;
  formatting: SelectionFormatting;
}

const fontSizes = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
  "56px",
  "64px",
];

export default function EditorFontSize({
  editor,
  formatting,
}: EditorFontSizeProps) {
  const value = formatting.fontSize ?? "";
  const displaySize = value
    ? value.replace(/px$/i, "")
    : "16";

  function selectSize(newValue: string) {
    const chain = editor.chain().focus();

    if (!newValue) {
      chain.unsetFontSize().run();
    } else {
      chain.setFontSize(newValue).run();
    }
  }

  return (
    <EditorDropdown
      label={`Font size: ${value || "Default"}`}
      width={160}
      trigger={
        <span className="min-w-[20px] text-center text-[13px] font-semibold tabular-nums text-[var(--foreground)]">
          {formatting.fontSize === null && formatting.hasSelection
            ? "—"
            : displaySize}
        </span>
      }
    >
      {(close) => (
        <>
          <div className="px-2.5 pb-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Font size
            </span>
          </div>

          <EditorDropdownItem
            active={!value}
            onClick={() => {
              selectSize("");
              close();
            }}
          >
            Default
          </EditorDropdownItem>

          <div className="my-1.5 border-t border-[var(--border)]" />

          <div className="grid grid-cols-3 gap-1">
            {fontSizes.map((size) => {
              const active = value === size;

              return (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    selectSize(size);
                    close();
                  }}
                  aria-pressed={active}
                  className={`
                    rounded-lg px-2 py-2 text-[12px] tabular-nums
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--accent)]
                    disabled:pointer-events-none disabled:opacity-40
                    ${
                      active
                        ? "bg-[var(--active)] font-semibold text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
                    }
                  `}
                >
                  {size.replace("px", "")}
                </button>
              );
            })}
          </div>
        </>
      )}
    </EditorDropdown>
  );
}