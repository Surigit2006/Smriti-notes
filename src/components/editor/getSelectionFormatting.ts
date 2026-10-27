import type { Editor } from "@tiptap/react";
import type { Mark } from "@tiptap/pm/model";

export type SelectionFormatting = {
  hasSelection: boolean;

  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  inlineCode: boolean;
  superscript: boolean;
  subscript: boolean;

  fontFamily: string | null;
  fontSize: string | null;
  textColor: string | null;
  highlightColor: string | null;

  alignment: string | null;
  blockType: string | null;
};

function getMark(
  marks: readonly Mark[],
  name: string,
): Mark | null {
  return (
    marks.find((mark) => mark.type.name === name) ??
    null
  );
}

function getMarkAttribute(
  marks: readonly Mark[],
  markName: string,
  attribute: string,
): string | null {
  const mark = getMark(marks, markName);

  if (!mark) {
    return null;
  }

  const value = mark.attrs[attribute];

  return value == null ? null : String(value);
}

function getTextNodes(
  editor: Editor,
): Array<{
  marks: readonly Mark[];
}> {
  const { from, to } = editor.state.selection;
  const result: Array<{
    marks: readonly Mark[];
  }> = [];

  if (from === to) {
    return [
      {
        marks:
          editor.state.storedMarks ??
          editor.state.selection.$from.marks(),
      },
    ];
  }

  editor.state.doc.nodesBetween(
    from,
    to,
    (node) => {
      if (node.isText) {
        result.push({
          marks: node.marks,
        });
      }
    },
  );

  return result;
}

function getBooleanFormat(
  nodes: Array<{ marks: readonly Mark[] }>,
  markName: string,
): boolean {
  if (nodes.length === 0) {
    return false;
  }

  return nodes.every((node) =>
    node.marks.some(
      (mark) => mark.type.name === markName,
    ),
  );
}

function getValueFormat(
  nodes: Array<{ marks: readonly Mark[] }>,
  markName: string,
  attribute: string,
): string | null {
  if (nodes.length === 0) {
    return null;
  }

  const values = nodes.map((node) =>
    getMarkAttribute(
      node.marks,
      markName,
      attribute,
    ),
  );

  const first = values[0];

  for (const value of values) {
    if (value !== first) {
      return null;
    }
  }

  return first;
}

function getBlockType(
  editor: Editor,
): string | null {
  const { from, to } = editor.state.selection;
  const values: string[] = [];

  editor.state.doc.nodesBetween(
    from,
    to,
    (node) => {
      if (node.type.name === "paragraph") {
        values.push("paragraph");
      }

      if (node.type.name === "heading") {
        values.push(`h${node.attrs.level}`);
      }
    },
  );

  if (values.length === 0) {
    const node = editor.state.selection.$from.parent;

    if (node.type.name === "heading") {
      return `h${node.attrs.level}`;
    }

    if (node.type.name === "paragraph") {
      return "paragraph";
    }

    return null;
  }

  const first = values[0];

  return values.every(
    (value) => value === first,
  )
    ? first
    : null;
}

function getAlignment(
  editor: Editor,
): string | null {
  const { from, to } = editor.state.selection;
  const values: Array<string | null> = [];

  editor.state.doc.nodesBetween(
    from,
    to,
    (node) => {
      if (
        node.type.name === "paragraph" ||
        node.type.name === "heading"
      ) {
        values.push(
          node.attrs.textAlign ?? null,
        );
      }
    },
  );

  if (values.length === 0) {
    const node = editor.state.selection.$from.parent;

    if (
      node.type.name === "paragraph" ||
      node.type.name === "heading"
    ) {
      return node.attrs.textAlign ?? null;
    }

    return null;
  }

  const first = values[0];

  return values.every(
    (value) => value === first,
  )
    ? first
    : null;
}

export function getSelectionFormatting(
  editor: Editor,
): SelectionFormatting {
  const { from, to } = editor.state.selection;

  const textNodes = getTextNodes(editor);

  return {
    hasSelection: from !== to,

    bold: getBooleanFormat(
      textNodes,
      "bold",
    ),

    italic: getBooleanFormat(
      textNodes,
      "italic",
    ),

    underline: getBooleanFormat(
      textNodes,
      "underline",
    ),

    strike: getBooleanFormat(
      textNodes,
      "strike",
    ),

    inlineCode: getBooleanFormat(
      textNodes,
      "code",
    ),

    superscript: getBooleanFormat(
      textNodes,
      "superscript",
    ),

    subscript: getBooleanFormat(
      textNodes,
      "subscript",
    ),

    fontFamily: getValueFormat(
      textNodes,
      "textStyle",
      "fontFamily",
    ),

    fontSize: getValueFormat(
      textNodes,
      "textStyle",
      "fontSize",
    ),

    textColor: getValueFormat(
      textNodes,
      "textStyle",
      "color",
    ),

    highlightColor: getValueFormat(
      textNodes,
      "highlight",
      "color",
    ),

    alignment: getAlignment(editor),

    blockType: getBlockType(editor),
  };
}