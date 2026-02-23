import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";

import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export const tiptapExtensionsServer = [
  StarterKit,
  Highlight,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Table,
  TableRow,
  TableCell,
  TableHeader,
];
