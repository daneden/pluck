import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// VS Code Dark+ inspired theme
const vsDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#d4d4d4",
      fontFamily: "var(--font-mono), monospace",
      padding: "16px 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#d4d4d4",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "#264f78",
      },
    ".cm-panels": {
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
    },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      color: "#858585",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#3c3c3c",
      border: "none",
      color: "#d4d4d4",
    },
    ".cm-tooltip": {
      backgroundColor: "#252526",
      border: "1px solid #454545",
      color: "#d4d4d4",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "#454545",
      borderBottomColor: "#454545",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "#252526",
      borderBottomColor: "#252526",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#04395e",
        color: "#d4d4d4",
      },
    },
    ".cm-scroller": {
      overflow: "auto",
    },
    ".cm-placeholder": {
      color: "#5a5a5a",
    },
  },
  { dark: true }
);

const vsDarkHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: "#569cd6" },
  { tag: tags.operator, color: "#d4d4d4" },
  { tag: tags.special(tags.variableName), color: "#9cdcfe" },
  { tag: tags.typeName, color: "#4ec9b0" },
  { tag: tags.atom, color: "#569cd6" },
  { tag: tags.number, color: "#b5cea8" },
  { tag: tags.definition(tags.variableName), color: "#9cdcfe" },
  { tag: tags.string, color: "#ce9178" },
  { tag: tags.special(tags.string), color: "#ce9178" },
  { tag: tags.comment, color: "#6a9955" },
  { tag: tags.variableName, color: "#9cdcfe" },
  { tag: tags.tagName, color: "#569cd6" },
  { tag: tags.bracket, color: "#d4d4d4" },
  { tag: tags.meta, color: "#d4d4d4" },
  { tag: tags.attributeName, color: "#9cdcfe" },
  { tag: tags.propertyName, color: "#9cdcfe" },
  { tag: tags.className, color: "#4ec9b0" },
  { tag: tags.invalid, color: "#f44747" },
  { tag: tags.bool, color: "#569cd6" },
  { tag: tags.null, color: "#569cd6" },
]);

export const vsDark = [vsDarkTheme, syntaxHighlighting(vsDarkHighlighting)];
