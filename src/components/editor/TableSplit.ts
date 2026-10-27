import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import { TableMap, type CellSelection } from "@tiptap/pm/tables";

/**
 * Tiptap's built-in splitCell() only un-merges cells that were merged before.
 * These helpers split a normal single cell into two columns or two rows,
 * the way Google Docs does:
 *
 *  - columns: a new column is added to the table; every OTHER row's cell in
 *    that column is stretched across it, so the rest of the table keeps its shape.
 *  - rows: a new row is added; every OTHER cell in that row is stretched
 *    down across it.
 */

type PlainCell = {
  cellPos: number; // absolute position of the cell
  tableStart: number; // absolute position where the table content starts
  table: ProseMirrorNode;
};

const CELL_NAMES = ["tableCell", "tableHeader"];

/** Returns the selected cell if it is a normal (not merged) single cell. */
export function findPlainCell(editor: Editor): PlainCell | null {
  const { selection } = editor.state;

  let $ref: ResolvedPos;
  let cell: ProseMirrorNode | null | undefined;
  let cellPos: number;
  let tableDepth: number;

  if ("$anchorCell" in selection) {
    // Drag-selected cells: only valid when exactly one cell is selected
    const cellSelection = selection as CellSelection;
    if (cellSelection.$anchorCell.pos !== cellSelection.$headCell.pos) {
      return null;
    }

    $ref = cellSelection.$anchorCell;
    cell = $ref.nodeAfter;
    cellPos = $ref.pos;
    tableDepth = $ref.depth - 1;
  } else {
    const { $from } = selection;
    let depth = $from.depth;

    while (depth > 0 && !CELL_NAMES.includes($from.node(depth).type.name)) {
      depth -= 1;
    }

    if (depth === 0) return null;

    $ref = $from;
    cell = $from.node(depth);
    cellPos = $from.before(depth);
    tableDepth = depth - 2;
  }

  if (!cell || tableDepth < 0) return null;

  // Merged cells are handled by the built-in "Unmerge" (splitCell)
  if ((cell.attrs.colspan ?? 1) !== 1 || (cell.attrs.rowspan ?? 1) !== 1) {
    return null;
  }

  const table = $ref.node(tableDepth);
  if (table.type.name !== "table") return null;

  return { cellPos, tableStart: $ref.start(tableDepth), table };
}

export function canSplitPlainCell(editor: Editor): boolean {
  return findPlainCell(editor) !== null;
}

export function splitPlainCell(
  editor: Editor,
  direction: "columns" | "rows",
): boolean {
  const found = findPlainCell(editor);
  if (!found) return false;

  const { cellPos, tableStart, table } = found;
  const map = TableMap.get(table);
  const relativePos = cellPos - tableStart;
  const rect = map.findCell(relativePos);

  const { tr, schema } = editor.state;

  // Unique neighbouring cells that must be stretched
  const stretch = new Set<number>();

  if (direction === "columns") {
    for (let row = 0; row < map.height; row += 1) {
      const pos = map.map[row * map.width + rect.left];
      if (pos !== relativePos) stretch.add(pos);
    }
  } else {
    for (let col = 0; col < map.width; col += 1) {
      const pos = map.map[rect.top * map.width + col];
      if (pos !== relativePos) stretch.add(pos);
    }
  }

  const attr = direction === "columns" ? "colspan" : "rowspan";

  // setNodeMarkup does not change node sizes, so positions stay valid
  for (const relative of stretch) {
    const absolute = tableStart + relative;
    const node = tr.doc.nodeAt(absolute);
    if (!node) continue;

    tr.setNodeMarkup(absolute, undefined, {
      ...node.attrs,
      [attr]: (node.attrs[attr] ?? 1) + 1,
      // Saved column widths no longer match once a column is added
      ...(direction === "columns" ? { colwidth: null } : {}),
    });
  }

  const cellNode = tr.doc.nodeAt(cellPos);
  if (!cellNode) return false;

  if (direction === "columns") {
    const newCell = cellNode.type.createAndFill();
    if (!newCell) return false;

    tr.insert(cellPos + cellNode.nodeSize, newCell);
  } else {
    // New cell keeps this column's width; it goes in a new row below
    const newCell = cellNode.type.createAndFill({
      colwidth: cellNode.attrs.colwidth,
    });
    if (!newCell) return false;

    let rowEnd = tableStart;
    for (let i = 0; i <= rect.top; i += 1) {
      rowEnd += table.child(i).nodeSize;
    }

    tr.insert(rowEnd, schema.nodes.tableRow.create(null, newCell));
  }

  editor.view.dispatch(tr);
  editor.view.focus();
  return true;
}