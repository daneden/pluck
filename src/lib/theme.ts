import { vsCodeDark } from "@fsegurai/codemirror-theme-vscode-dark";
import { EditorView } from "@codemirror/view";

// Extend the VS Code Dark theme with full-height + placeholder styling
const overrides = EditorView.theme({
  "&": { height: "100%" },
  ".cm-content": {
    fontFamily: "var(--font-mono), monospace",
    padding: "16px 0",
  },
  ".cm-placeholder": { color: "#5a5a5a" },
  ".cm-gutters": { border: "none" },
});

export const vsDark = [vsCodeDark, overrides];
