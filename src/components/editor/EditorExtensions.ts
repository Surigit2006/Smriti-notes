import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";

import CodeBlockView from "./Codeblockview";

// Code block with a "Copy" button (custom React node view)
const CopyableCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});

// Adds a saved background color to table cells
const cellBackground = {
  backgroundColor: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) =>
      element.getAttribute("data-bg") ||
      element.style.backgroundColor ||
      null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? {
            "data-bg": attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        : {},
  },
};

const ColoredTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});

const ColoredTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },

    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },

    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },

    // Replaced by CopyableCodeBlock below
    codeBlock: false,
  }),

  CopyableCodeBlock,

  TextStyleKit.configure({
    color: {
      types: ["textStyle"],
    },

    fontFamily: {
      types: ["textStyle"],
    },

    fontSize: {
      types: ["textStyle"],
    },
  }),

  Superscript,
  Subscript,

  Highlight.configure({
    multicolor: true,
  }),

  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),

  TaskList,

  TaskItem.configure({
    nested: true,
  }),

  Table.configure({
    resizable: true,
  }),
  TableRow,
  ColoredTableHeader,
  ColoredTableCell,
];