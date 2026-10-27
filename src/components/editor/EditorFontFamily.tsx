"use client";

import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Type, Check } from "lucide-react";

import type { SelectionFormatting } from "./getSelectionFormatting";
import {
  EditorDropdown,
  EditorDropdownItem,
} from "./EditorDropdown";

interface EditorFontFamilyProps {
  editor: Editor;
  formatting: SelectionFormatting;
}

type Generic = "sans-serif" | "serif" | "monospace" | "cursive" | "fantasy";

type FontOption = {
  label: string;
  /** Saved in the note. Includes a generic fallback so text never turns into Times. */
  value: string;
  /** Google Fonts "family=" fragment. Omitted for fonts already on the device. */
  google?: string;
};

type FontGroup = {
  title: string;
  fonts: FontOption[];
};

/** A font loaded from Google Fonts. `bold: false` for fonts with only one weight. */
const web = (name: string, generic: Generic, bold = true): FontOption => ({
  label: name,
  value: `'${name}', ${generic}`,
  google: name.replace(/ /g, "+") + (bold ? ":wght@400;700" : ""),
});

/** A font already installed on most devices. */
const system = (label: string, generic: Generic): FontOption => ({
  label,
  value: label.includes(" ") ? `'${label}', ${generic}` : `${label}, ${generic}`,
});

const FONT_GROUPS: FontGroup[] = [
  {
    title: "Sans serif",
    fonts: [
      web("Inter", "sans-serif"),
      web("Roboto", "sans-serif"),
      web("Open Sans", "sans-serif"),
      web("Lato", "sans-serif"),
      web("Montserrat", "sans-serif"),
      web("Poppins", "sans-serif"),
      web("Nunito", "sans-serif"),
      web("Work Sans", "sans-serif"),
      web("DM Sans", "sans-serif"),
      web("Raleway", "sans-serif"),
      web("Manrope", "sans-serif"),
      web("Quicksand", "sans-serif"),
      system("Arial", "sans-serif"),
      system("Helvetica", "sans-serif"),
      system("Verdana", "sans-serif"),
      system("Tahoma", "sans-serif"),
      system("Trebuchet MS", "sans-serif"),
    ],
  },
  {
    title: "Serif",
    fonts: [
      web("Playfair Display", "serif"),
      web("Merriweather", "serif"),
      web("Lora", "serif"),
      web("Crimson Text", "serif"),
      web("EB Garamond", "serif"),
      web("Libre Baskerville", "serif"),
      web("PT Serif", "serif"),
      web("Cormorant Garamond", "serif"),
      web("Source Serif 4", "serif"),
      system("Georgia", "serif"),
      system("Times New Roman", "serif"),
      system("Palatino", "serif"),
    ],
  },
  {
    title: "Monospace",
    fonts: [
      web("JetBrains Mono", "monospace"),
      web("Fira Code", "monospace"),
      web("Source Code Pro", "monospace"),
      web("IBM Plex Mono", "monospace"),
      web("Roboto Mono", "monospace"),
      web("Space Mono", "monospace"),
      web("Inconsolata", "monospace"),
      system("Courier New", "monospace"),
    ],
  },
  {
    title: "Handwriting",
    fonts: [
      web("Caveat", "cursive"),
      web("Dancing Script", "cursive"),
      web("Kalam", "cursive"),
      web("Pacifico", "cursive", false),
      web("Patrick Hand", "cursive", false),
      web("Indie Flower", "cursive", false),
      web("Shadows Into Light", "cursive", false),
      web("Satisfy", "cursive", false),
    ],
  },
  {
    title: "Display",
    fonts: [
      web("Oswald", "sans-serif"),
      web("Comfortaa", "sans-serif"),
      web("Bebas Neue", "sans-serif", false),
      web("Anton", "sans-serif", false),
      web("Righteous", "sans-serif", false),
      web("Lobster", "cursive", false),
      web("Abril Fatface", "serif", false),
    ],
  },
];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  FONT_GROUPS.flatMap((group) => group.fonts)
    .filter((font) => font.google)
    .map((font) => `family=${font.google}`)
    .join("&") +
  "&display=swap";

const FONT_LINK_ID = "smriti-google-fonts";

/** "'Playfair Display', serif" → "playfair display" */
function firstFamily(value: string) {
  return value
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
}

export default function EditorFontFamily({
  editor,
  formatting,
}: EditorFontFamilyProps) {
  const value = formatting.fontFamily ?? "";

  // Load the web fonts once (they are only downloaded when actually used)
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  const allFonts = FONT_GROUPS.flatMap((group) => group.fonts);

  const currentFont = value
    ? allFonts.find((font) => firstFamily(font.value) === firstFamily(value))
    : undefined;

  const label = !value ? "Default" : (currentFont?.label ?? "Mixed");

  function selectFont(newValue: string) {
    const chain = editor.chain().focus();

    if (!newValue) {
      chain.unsetFontFamily().run();
    } else {
      chain.setFontFamily(newValue).run();
    }
  }

  return (
    <EditorDropdown
      label={`Font family: ${label}`}
      icon={<Type size={15} />}
      width={248}
    >
      {(close) => (
        <div className="flex max-h-[min(420px,60vh)] flex-col gap-0.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Font family
          </div>

          <EditorDropdownItem
            selected={!value}
            onClick={() => {
              selectFont("");
              close();
            }}
          >
            <span className="flex-1 truncate">Default</span>

            {!value && (
              <Check size={14} className="shrink-0 text-[var(--accent)]" />
            )}
          </EditorDropdownItem>

          {FONT_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-0.5">
              <div className="mt-1 border-t border-[var(--border)] px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {group.title}
              </div>

              {group.fonts.map((font) => {
                const selected =
                  !!value && firstFamily(font.value) === firstFamily(value);

                return (
                  <EditorDropdownItem
                    key={font.value}
                    selected={selected}
                    onClick={() => {
                      selectFont(font.value);
                      close();
                    }}
                  >
                    <span
                      className="flex-1 truncate"
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </span>

                    {selected && (
                      <Check
                        size={14}
                        className="shrink-0 text-[var(--accent)]"
                      />
                    )}
                  </EditorDropdownItem>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </EditorDropdown>
  );
}