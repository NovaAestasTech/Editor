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
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import { ResetAllFormattingButton } from "./tiptap-ui/reset-all-formatting-button";
import { Ai } from "@tiptap-pro/extension-ai";
import { UiState } from "@/components/tiptap-extension/ui-state-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Selection } from "@tiptap/extensions";
import { useAi, AiProvider } from "./context/AiContext";
import { AiMenu } from "@/components/tiptap-ui/ai-menu";
import { AiAskButton } from "@/components/tiptap-ui/ai-ask-button";
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import Heading from "@tiptap/extension-heading";
import { TurnIntoDropdown } from "@/components/tiptap-ui/turn-into-dropdown";
export const AiMenuExample = () => {
  return (
    <AiProvider>
      <AiEditorWrapper />
    </AiProvider>
  );
};
const AiEditorWrapper = () => {
  const { aiToken } = useAi();

  if (!aiToken) {
    return <div className="tiptap-editor-wrapper">Loading AI...</div>;
  }

  return <Tiptap aiToken={aiToken} />;
};

const Tiptap = ({ aiToken }: { aiToken: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
      }),

      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      HorizontalRule,
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
      Selection,
      UiState,
      TableHandleExtension,
      NodeAlignment,
      NodeBackground,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Image,
      Ai.configure({
        appId: "123",
        token: aiToken,
        autocompletion: false,
        baseUrl: "/api/ai",
        showDecorations: true,
        hideDecorationsOnStreamEnd: false,
        onLoading: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true);
          context.editor.commands.aiGenerationHasMessage(false);
        },
        onChunk: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true);
          context.editor.commands.aiGenerationHasMessage(true);
        },
        onSuccess: (context) => {
          const hasMessage = !!context.response;
          context.editor.commands.aiGenerationSetIsLoading(false);
          context.editor.commands.aiGenerationHasMessage(hasMessage);
        },
      }),
    ],

    content: `
      <p><strong>Project Title: AI-Powered Personalized Route Planner</strong></p>
    <p><strong>Description:</strong></p>
    <p><strong>This project is a full-stack AI-powered travel planner that generates personalized travel routes</strong>
    <strong>based on user preferences and duration of the trip. Built using Next.js (React) and TypeScript on</strong>
    <strong>the frontend, with a FastAPI backend and styled using Tailwind CSS, the application delivers a</strong>
    <strong>seamless and modern user experience.</strong></p>
    <p><strong>Users can specify how many days they want to spend at a location and select their areas of interest</strong>
    <strong>(such as culture, adventure, food, nature, etc.). The system then uses AI algorithms to analyze and</strong>
    <strong>return a ranked list of the top 10 places to visit, optimized to match the user's interests and fit</strong>
    <strong>within the available timeframe. Each destination is plotied on an interacive map with the ideal</strong>
    <strong>route marked between them, offering a complete and efficient travel plan.</strong></p>
    <p><strong>Key Features:</strong></p>
    <ul>
    <li>
    <p><strong>Frontend: Built with Next.js and TypeScript for fast, SEO-friendly, and scalable UI.</strong></p>
    </li>
    <li>
    <p><strong>Backend: FastAPI powers the backend with efficient AI-driven route and place</strong>
    <strong>recommendations.</strong></p>
    </li>
    <li>
    <p><strong>Styling: Tailwind CSS provides a responsive and modern design.</strong></p>
    </li>
    <li>
    <p><strong>Smart Itinerary Generation: AI optimizes suggestions based on user input and location</strong>
    <strong>data.</strong></p>
    </li>
    <li>
    <p><strong>Interacive Map Integration: Visual representation of routes and destinations with</strong>
    <strong>geolocation support.</strong></p>
    </li>
    <li>
    <p><strong>Custom Filters: Allows users to fine-tune their travel experience based on selected</strong>
    <strong>interests.</strong></p>
    </li>
    </ul>

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
                <ButtonGroup orientation="horizontal">
                  <AiAskButton />
                </ButtonGroup>
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />

              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`text-black  ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
                >
                  B
                </button>
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />
              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`text-black ${editor.isActive("italic") ? "is-active" : ""}`}
                >
                  Italic
                </button>
              </div>
              <div className="w-px h-6 bg-slate-300 mx-1" />
              <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`text-black ${editor.isActive("underline") ? "is-active" : ""}`}
                >
                  Underline
                </button>
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
              <EditorContent
                editor={editor}
                role="presentation"
                className="control-showcase"
              >
                <AiMenu />
              </EditorContent>
            </div>
          </EditorContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
