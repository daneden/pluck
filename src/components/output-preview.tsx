"use client";

import { useCallback, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vsDark } from "@/lib/theme";
import { EditorView } from "@codemirror/view";
import type { EvalResult } from "@/lib/evaluate";

interface OutputPreviewProps {
  result: EvalResult | null;
}

export function OutputPreview({ result }: OutputPreviewProps) {
  const [copied, setCopied] = useState(false);

  const { value, isError, isEmpty } = useMemo(() => {
    if (result === null) {
      return { value: "", isError: false, isEmpty: true };
    }
    if (!result.success) {
      return { value: result.error, isError: true, isEmpty: false };
    }
    if (result.value === undefined) {
      return { value: "", isError: false, isEmpty: true };
    }
    const formatted =
      typeof result.value === "string"
        ? result.value
        : JSON.stringify(result.value, null, 2);
    return { value: formatted, isError: false, isEmpty: false };
  }, [result]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  const extensions = useMemo(
    () => [json(), EditorView.lineWrapping, EditorView.editable.of(false)],
    []
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">Output</span>
        {!isEmpty && !isError && (
          <button
            onClick={handleCopy}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {isError ? (
          <div className="p-4">
            <span className="text-red-400 font-mono text-sm">{value}</span>
          </div>
        ) : isEmpty ? (
          <div className="p-4">
            <span className="text-neutral-600 italic text-sm">
              Paste JSON and write an expression to see output
            </span>
          </div>
        ) : (
          <CodeMirror
            value={value}
            extensions={extensions}
            theme={vsDark}
            editable={false}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: false,
            }}
            style={{ height: "100%", fontSize: "16px" }}
          />
        )}
      </div>
    </div>
  );
}
