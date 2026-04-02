"use client";

import { useCallback, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import type { EvalResult } from "@/lib/evaluate";

interface OutputPreviewProps {
  result: EvalResult | null;
}

export function OutputPreview({ result }: OutputPreviewProps) {
  const [copied, setCopied] = useState(false);

  const { value, language, isError, isEmpty } = useMemo(() => {
    if (result === null) {
      return { value: "", language: "plaintext" as const, isError: false, isEmpty: true };
    }
    if (!result.success) {
      return { value: result.error, language: "plaintext" as const, isError: true, isEmpty: false };
    }
    if (result.value === undefined) {
      return { value: "", language: "plaintext" as const, isError: false, isEmpty: true };
    }
    const formatted =
      typeof result.value === "string"
        ? result.value
        : JSON.stringify(result.value, null, 2);
    return { value: formatted, language: "json" as const, isError: false, isEmpty: false };
  }, [result]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">Output</span>
        <div className="flex items-center gap-3">
          {isError && (
            <span className="text-sm text-red-400 truncate">{value}</span>
          )}
          {!isEmpty && !isError && (
            <button
              onClick={handleCopy}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {isError || isEmpty ? (
          <div className="p-4">
            {isError ? (
              <span className="text-red-400 font-mono text-sm">{value}</span>
            ) : (
              <span className="text-neutral-600 italic text-sm">
                Paste JSON and write an expression to see output
              </span>
            )}
          </div>
        ) : (
          <Editor
            language={language}
            value={value}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              fontSize: 16,
              fontFamily: "monospace",
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              folding: true,
              domReadOnly: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
