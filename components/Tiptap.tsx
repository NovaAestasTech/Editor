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
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import { TurnIntoDropdown } from "@/components/tiptap-ui/turn-into-dropdown";
import { tempStore } from "@/app/lib/tempStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Sparkles } from "lucide-react";
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
  const [initialContent, setInitialContent] = useState<string>("");
  const [summarizerContent, setsummarizerContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/ai/test-api");
        const data = await res.json();
        setInitialContent(data.content);
      } catch (err) {
        console.log(err);

        setInitialContent(tempStore.content || "");
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, []);

  const editor = useEditor(
    {
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
        Underline,
        Image,
        Ai.configure({
          appId: "123",
          token: aiToken,
          autocompletion: false,
          baseUrl: "/api/ai/catch",
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

      content: `${initialContent}`,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "tiptap prose max-w-none min-h-[300px] p-8 focus:outline-none text-slate-900",
        },
      },
      editable: true,
    },
    [initialContent],
  );

  if (isLoading || !editor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-slate-600">Loading editor...</div>
      </div>
    );
  }
  const Summarizeit = async () => {
    try {
      const data = await fetch(
        `https://3t3rnal-summarizer-hf.hf.space/summarize/text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: editor?.getText(),
          }),
        },
      );
      const result = await data.json();
      setsummarizerContent(result.summary);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        throw new Error("Unidentified Error");
      }
    }
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">
            Document Editor
          </span>
          <Button
            onClick={Summarizeit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r hover:opacity-90 text-white shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Summarize
              </>
            )}
          </Button>
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
      {summarizerContent && (
        <Card className="mt-8 border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              AI Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {summarizerContent}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tiptap;
