"use client";

import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import type { EvalResult } from "@/lib/evaluate";

interface OutputPreviewProps {
  result: EvalResult | null;
}

export function OutputPreview({ result }: OutputPreviewProps) {
  const { value, language, isError } = useMemo(() => {
    if (result === null) {
      return { value: "", language: "plaintext" as const, isError: false };
    }
    if (!result.success) {
      return { value: result.error, language: "plaintext" as const, isError: true };
    }
    if (result.value === undefined) {
      return { value: "", language: "plaintext" as const, isError: false };
    }
    const formatted =
      typeof result.value === "string"
        ? result.value
        : JSON.stringify(result.value, null, 2);
    return { value: formatted, language: "json" as const, isError: false };
  }, [result]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">Output</span>
        {isError && (
          <span className="text-sm text-red-400 truncate ml-4">{value}</span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {isError ? (
          <div className="p-4">
            <span className="text-red-400 font-mono text-sm">{value}</span>
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
              fontSize: 14,
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
