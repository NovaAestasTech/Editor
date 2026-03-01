import { Mark, mergeAttributes } from "@tiptap/core";

export interface LogicalIssueOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    logicalIssue: {
      setLogicalIssue: (issueId: string) => ReturnType;
      unsetLogicalIssue: () => ReturnType;
      clearAllLogicalIssues: () => ReturnType;
    };
  }
}

export const LogicalIssue = Mark.create<LogicalIssueOptions>({
  name: "logicalIssue",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      issueId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-issue-id"),
        renderHTML: (attributes) => {
          if (!attributes.issueId) {
            return {};
          }
          return {
            "data-issue-id": attributes.issueId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark[data-issue-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "logical-issue-highlight",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setLogicalIssue:
        (issueId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { issueId });
        },
      unsetLogicalIssue:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      clearAllLogicalIssues:
        () =>
        ({ chain, state }) => {
          const { tr } = state;
          let modified = false;

          state.doc.descendants((node, pos) => {
            if (node.marks) {
              node.marks.forEach((mark) => {
                if (mark.type.name === this.name) {
                  const from = pos;
                  const to = pos + node.nodeSize;
                  tr.removeMark(from, to, mark.type);
                  modified = true;
                }
              });
            }
          });

          if (modified) {
            return chain().focus().run();
          }

          return true;
        },
    };
  },
});
