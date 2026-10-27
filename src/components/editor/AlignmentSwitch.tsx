
"use client";

import type { MouseEvent } from "react";
import type { Editor } from "@tiptap/react";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
} from "lucide-react";

type Alignment = "left" | "center" | "right" | "justify";

interface AlignmentSwitchProps {
  editor: Editor;
  alignment: string | null;
}

const ALIGNMENTS: Alignment[] = [
  "left",
  "center",
  "right",
  "justify",
];

const ALIGNMENT_LABELS: Record<Alignment, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
  justify: "Justify",
};

function getAlignment(value: string | null): Alignment {
  if (
    value === "left" ||
    value === "center" ||
    value === "right" ||
    value === "justify"
  ) {
    return value;
  }

  return "left";
}

function getNextAlignment(current: Alignment): Alignment {
  const index = ALIGNMENTS.indexOf(current);
  return ALIGNMENTS[(index + 1) % ALIGNMENTS.length];
}

function getAlignmentIcon(alignment: Alignment) {
  switch (alignment) {
    case "left":
      return AlignLeft;
    case "center":
      return AlignCenter;
    case "right":
      return AlignRight;
    case "justify":
      return AlignJustify;
  }
}

export default function AlignmentSwitch({
  editor,
  alignment,
}: AlignmentSwitchProps) {
  const currentAlignment = getAlignment(alignment);
  const nextAlignment = getNextAlignment(currentAlignment);
  const Icon = getAlignmentIcon(currentAlignment);

  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    editor.chain().focus().setTextAlign(nextAlignment).run();
  }

  return (
    <button
      type="button"
      title={`Alignment: ${ALIGNMENT_LABELS[currentAlignment]} — click for ${ALIGNMENT_LABELS[nextAlignment]}`}
      aria-label={`Text alignment: ${ALIGNMENT_LABELS[currentAlignment]}`}
      aria-pressed={currentAlignment !== "left"}
      onMouseDown={handleMouseDown}
      className="
        group relative flex h-8 w-9 shrink-0 items-center justify-center
        rounded-lg text-[var(--muted)]
        transition-all duration-150
        hover:bg-[var(--hover)] hover:text-[var(--foreground)]
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--accent)]
      "
    >
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />

      <span
        className="
          pointer-events-none absolute bottom-[3px]
          h-[2px] w-3 rounded-full
          bg-[var(--accent)]
          transition-all duration-150 group-hover:w-4
        "
        aria-hidden="true"
      />
    </button>
  );
}
