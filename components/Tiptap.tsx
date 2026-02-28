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
import Underline from "@tiptap/extension-underline";
import { TurnIntoDropdown } from "@/components/tiptap-ui/turn-into-dropdown";
import { tempStore } from "@/app/lib/tempStore";
import { useEffect, useState } from "react";
import { generateHTML } from "@tiptap/react";
import { tiptapExtensionsServer } from "@/lib/tiptapExtensions";
import {
  Loader2,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  Moon,
  Sun,
} from "lucide-react";

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
  const [checkLogic, setCheckLogic] = useState(false);
  const [initialContent, setInitialContent] = useState<string>("");
  const [summarizerContent, setsummarizerContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark class on <html> for tiptap button dark mode support
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
            "tiptap prose max-w-none min-h-[300px] focus:outline-none text-slate-900",
        },
      },
      editable: true,
    },
    [initialContent],
  );

  if (isLoading || !editor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="text-neutral-400">Loading editor...</div>
      </div>
    );
  }

  const Summarizeit = async () => {
    setIsSummarizing(true);
    setShowSummary(true);
    try {
      setIsSummarizing(true);
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
    } finally {
      setIsSummarizing(false);
    }
  };

  // Conditional style helpers
  const bg = darkMode ? "#1a1a1e" : "#f0f0f2";
  const topBarBg = darkMode ? "#222226" : "#fafafa";
  const topBarBorder = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const panelBg = darkMode ? "#2a2a2e" : "#e8e8ec";
  const textPrimary = darkMode ? "text-neutral-300" : "text-neutral-700";
  const textSecondary = darkMode ? "text-neutral-400" : "text-neutral-500";
  const textMuted = darkMode ? "text-neutral-500" : "text-neutral-400";
  const btnGroupCls = darkMode
    ? "flex items-center gap-0.5 bg-white/10 p-1 rounded-lg border border-white/10 shadow-sm"
    : "flex items-center gap-0.5 bg-white/70 p-1 rounded-lg border border-neutral-200/60 shadow-sm";
  const dividerCls = darkMode
    ? "w-px h-5 bg-white/10 mx-0.5"
    : "w-px h-5 bg-neutral-300/60 mx-0.5";
  const inlineBtnText = darkMode ? "text-neutral-200" : "text-neutral-700";
  const inlineBtnActive = darkMode ? "bg-white/20" : "bg-neutral-200";
  const inlineBtnHover = darkMode
    ? "hover:bg-white/10"
    : "hover:bg-neutral-100";
  const pageShadow = darkMode
    ? "0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)"
    : "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)";
  const summaryPanelBg = darkMode ? "#2a2a2e" : "#fafafa";
  const summaryBorder = darkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
  const summaryPanelShadow = darkMode
    ? "0 2px 8px rgba(0,0,0,0.2)"
    : "0 2px 8px rgba(0,0,0,0.06)";

  const handleLogicCheck = async () => {
    setCheckLogic(true);
    try {
      const res = await fetch("/api/ai/checks/crossCheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editor.getText(),
        }),
      });

      const data = await res.json();
      
      const statements = data.statements || [];
      if (statements.length === 0) {
        alert("✓ No logical inconsistencies found!");
      } else {
        // Format results for user display
        const issues = statements
          .map((s: any, i: number) => `${i + 1}. ${s.text}\n   → ${s.description}`)
          .join("\n\n");
        alert(`⚠ Logical Issues Found:\n\n${issues}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(`Error checking logic: ${e.message}`);
        console.error(e.message);
      } else {
        alert("An unknown error occurred while checking logic.");
      }
    } finally {
      setCheckLogic(false);
    }
  };

  const exportTodocx = async () => {
    try {
      const html = generateHTML(editor.getJSON(), tiptapExtensionsServer);
      const res = await fetch("api/ai/export-docx", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          content: html,
          filename: "Document",
        }),
      });
      const result = await res.blob();
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = "MyDocument.docx";
      a.click();
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        throw new Error("Unidentified Error");
      }
    }
  };
  return (
    <div
      className={`flex  ${darkMode ? "bg-neutral-950" : "bg-neutral-200"}`}
      style={{ animation: "fadeIn 0.5s ease-out" }}
    >
      {/* Outer container — full screen */}
      <div
        className="w-full  flex flex-col "
        style={{
          background: bg,
          transition: "background 0.4s ease",
        }}
      >
        {/* ── Top bar ── */}
        <div
          className="sticky top-0 z-50 flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
          style={{
            borderColor: topBarBorder,
            background: topBarBg,
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          {/* Left — Document name */}
          <span
            className={`text-sm font-semibold tracking-tight whitespace-nowrap mr-3 ${textPrimary}`}
            style={{ transition: "color 0.3s ease" }}
          >
            Document Editor
          </span>

          {/* Center — Toolbar */}
          <EditorContext.Provider value={{ editor }}>
            <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
              <div className={btnGroupCls}>
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
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <TextAlignButton editor={editor} align="left" />
                <TextAlignButton editor={editor} align="center" />
                <TextAlignButton editor={editor} align="right" />
                <TextAlignButton editor={editor} align="justify" />
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <ButtonGroup orientation="horizontal">
                  <AiAskButton />
                </ButtonGroup>
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`${inlineBtnText} px-1.5 py-0.5 rounded text-sm font-bold ${editor.isActive("bold") ? inlineBtnActive : inlineBtnHover}`}
                >
                  B
                </button>
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`${inlineBtnText} px-1.5 py-0.5 rounded text-sm italic ${editor.isActive("italic") ? inlineBtnActive : inlineBtnHover}`}
                >
                  I
                </button>
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`${inlineBtnText} px-1.5 py-0.5 rounded text-sm underline ${editor.isActive("underline") ? inlineBtnActive : inlineBtnHover}`}
                >
                  U
                </button>
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <UndoRedoButton editor={editor} action="undo" />
                <UndoRedoButton editor={editor} action="redo" />
                <ResetAllFormattingButton editor={editor} />
              </div>
              <div className={dividerCls} />

              <div className={btnGroupCls}>
                <TableTriggerButton
                  editor={editor}
                  maxRows={8}
                  maxCols={8}
                  text="Table"
                />
              </div>
            </div>
          </EditorContext.Provider>

          {/* Right — Summarize + Theme toggle + Panel toggle */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {/* cross check button */}
            <button
              onClick={handleLogicCheck}
              disabled={checkLogic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
              style={{
                background: checkLogic 
                  ? "#75716f"
                  : "linear-gradient(135deg, #dd350c, #f56744)",
                opacity: checkLogic ? 0.7 : 1,
                transition: "opacity 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) =>
                !checkLogic && (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {checkLogic ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              {checkLogic ? "Checking…" : "! Logical Check"}
            </button>
            <button
              onClick={() => exportTodocx()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",

                transition: "opacity 0.2s ease, transform 0.15s ease",
              }}
            >
              Download
            </button>
            <button
              onClick={Summarizeit}
              disabled={isSummarizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                opacity: isSummarizing ? 0.7 : 1,
                transition: "opacity 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {isSummarizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isSummarizing ? "Summarizing…" : "Summarize"}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg ${darkMode ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/10" : "text-neutral-500 hover:text-neutral-700 hover:bg-black/5"}`}
              style={{ transition: "all 0.2s ease" }}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Panel toggle */}
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`p-1.5 rounded-lg ${darkMode ? "text-neutral-400 hover:text-neutral-200 hover:bg-white/10" : "text-neutral-500 hover:text-neutral-700 hover:bg-black/5"}`}
              style={{ transition: "all 0.2s ease" }}
              title={showSummary ? "Hide AI Summary" : "Show AI Summary"}
            >
              {showSummary ? (
                <PanelRightClose className="w-4.5 h-4.5" />
              ) : (
                <PanelRightOpen className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Content area (editor + summary side-by-side) ── */}
        <div className="flex flex-1   p-4 gap-4">
          {/* Editor panel — A4 page preview */}
          <div
            className="flex-1 min-w-0 flex flex-col items-center  "
            style={{
              background: panelBg,
              borderRadius: "12px",
              transition: "background 0.4s ease",
              padding: "clamp(16px, 3vw, 48px) clamp(8px, 2vw, 32px)",
            }}
          >
            {/* White A4 page */}
            <div
              style={{
                width: "100%",
                maxWidth: "794px",
                background: "#f8f9fb",
                borderRadius: "8px",
                boxShadow: pageShadow,
                fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)",
                lineHeight: "1.7",
                padding: "clamp(32px, 5vw, 72px) clamp(24px, 4vw, 64px)",
                transition: "box-shadow 0.4s ease",
              }}
            >
              <EditorContext.Provider value={{ editor }}>
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

                <EditorContent
                  editor={editor}
                  role="presentation"
                  className="control-showcase"
                >
                  <AiMenu />
                </EditorContent>
              </EditorContext.Provider>
            </div>
          </div>

          {/* AI Summary panel — slides in/out */}
          <div
            style={{
              width: showSummary ? "340px" : "0px",
              minWidth: showSummary ? "340px" : "0px",
              opacity: showSummary ? 1 : 0,
              padding: showSummary ? undefined : "0",
              overflow: "hidden",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              borderRadius: "12px",
              background: showSummary ? summaryPanelBg : "transparent",
              boxShadow: showSummary ? summaryPanelShadow : "none",
            }}
          >
            <div
              className="h-full flex flex-col"
              style={{
                opacity: showSummary ? 1 : 0,
                transform: showSummary ? "translateX(0)" : "translateX(20px)",
                transition: "opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s",
              }}
            >
              {/* Summary header */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
                style={{
                  borderColor: summaryBorder,
                  transition: "border-color 0.4s ease",
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
                <span
                  className={`text-sm font-semibold ${textPrimary}`}
                  style={{ transition: "color 0.3s ease" }}
                >
                  AI Summary
                </span>
              </div>

              {/* Summary content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3">
                {isSummarizing ? (
                  <div
                    className={`flex flex-col items-center justify-center h-full gap-3 ${textMuted}`}
                  >
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Generating summary…</span>
                  </div>
                ) : summarizerContent ? (
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${textPrimary}`}
                    style={{ transition: "color 0.3s ease" }}
                  >
                    {summarizerContent}
                  </p>
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center h-full text-center px-2 ${textMuted}`}
                  >
                    <Sparkles className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">
                      Click{" "}
                      <span className={`font-medium ${textSecondary}`}>
                        Summarize
                      </span>{" "}
                      to generate an AI summary of your document.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
