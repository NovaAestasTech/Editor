"use client";
import { Highlight } from "@tiptap/extension-highlight";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import { TableHandleExtension } from "@/components/tiptap-node/table-node/extensions/table-handle";
import { TextStyle } from "@tiptap/extension-text-style";
import { TableTriggerButton } from "@/components/tiptap-node/table-node/ui/table-trigger-button";
import { TableHandle } from "@/components/tiptap-node/table-node/ui/table-handle/table-handle";
import { TableSelectionOverlay } from "@/components/tiptap-node/table-node/ui/table-selection-overlay";
import { TableCellHandleMenu } from "@/components/tiptap-node/table-node/ui/table-cell-handle-menu";
import { TableExtendRowColumnButtons } from "@/components/tiptap-node/table-node/ui/table-extend-row-column-button";
import { TextAlign } from "@tiptap/extension-text-align";
import { NodeBackground } from "@/components/tiptap-extension/node-background-extension";
import { NodeAlignment } from "@/components/tiptap-extension/node-alignment-extension";

import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Image } from "@/components/tiptap-node/image-node/image-node-extension";
import "@/components/tiptap-node/table-node/styles/prosemirror-table.scss";
import "@/components/tiptap-node/table-node/styles/table-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { ResetAllFormattingButton } from "./tiptap-ui/reset-all-formatting-button";
import { ListButton } from "./tiptap-ui/list-button";
import Heading from "@tiptap/extension-heading";
import { TurnIntoDropdown } from "@/components/tiptap-ui/turn-into-dropdown";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),

      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),

      TableKit.configure({
        table: {
          resizable: true,
        },
      }),

      TableHandleExtension,
      NodeAlignment,
      NodeBackground,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Image,
    ],

    content: `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <p>A paragraph with <a href="#">a link</a> and <strong>bold text</strong>.</p>
      <blockquote>A blockquote with some insightful text.</blockquote>
      <hr/>
      <p>Another paragraph after a horizontal rule.</p>
    `,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap prose max-w-none min-h-[300px] p-8 focus:outline-none text-slate-900",
      },
    },
    editable: true,
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">
            Document Editor
          </span>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden focus-within:border-blue-500 transition-colors">
          <EditorContext.Provider value={{ editor }}>
            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <TurnIntoDropdown
                  editor={editor}
                  hideWhenUnavailable={false}
                  blockTypes={[
                    "paragraph",
                    "heading",
                    "bulletList",
                    "orderedList",
                  ]}
                  useCardLayout={true}
                  onOpenChange={(isOpen) =>
                    console.log("Dropdown toggled:", isOpen)
                  }
                />
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />

              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <TextAlignButton editor={editor} align="left" />
                <TextAlignButton editor={editor} align="center" />
                <TextAlignButton editor={editor} align="right" />
                <TextAlignButton editor={editor} align="justify" />
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />

              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <UndoRedoButton editor={editor} action="undo" />
                <UndoRedoButton editor={editor} action="redo" />
                <ResetAllFormattingButton editor={editor} />
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />

              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <TableTriggerButton
                  editor={editor}
                  maxRows={8}
                  maxCols={8}
                  text="Table"
                />
              </div>
            </div>

            <TableHandle />
            <TableSelectionOverlay
              showResizeHandles={true}
              cellMenu={(props) => (
                <TableCellHandleMenu
                  editor={props.editor}
                  onMouseDown={(e) => props.onResizeStart?.("br")(e)}
                />
              )}
            />
            <TableExtendRowColumnButtons />

            <div className="p-2">
              <EditorContent editor={editor} role="presentation" />
            </div>
          </EditorContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
