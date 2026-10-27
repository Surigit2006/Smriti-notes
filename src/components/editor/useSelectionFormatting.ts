"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

import {
  getSelectionFormatting,
  type SelectionFormatting,
} from "./getSelectionFormatting";

const DEFAULT_FORMATTING: SelectionFormatting = {
  hasSelection: false,

  bold: false,
  italic: false,
  underline: false,
  strike: false,
  inlineCode: false,
  superscript: false,
  subscript: false,

  fontFamily: null,
  fontSize: null,
  textColor: null,
  highlightColor: null,

  alignment: null,
  blockType: null,
};

export function useSelectionFormatting(
  editor: Editor | null,
): SelectionFormatting {
  const [formatting, setFormatting] =
    useState<SelectionFormatting>(
      DEFAULT_FORMATTING,
    );

  useEffect(() => {
    if (!editor) {
      setFormatting(DEFAULT_FORMATTING);
      return;
    }

    const update = () => {
      setFormatting(
        getSelectionFormatting(editor),
      );
    };

    update();

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

  return formatting;
}