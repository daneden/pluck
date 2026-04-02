"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { jsonPathAtLine } from "@/lib/json-path";

interface JsonInputProps {
  initialValue?: string;
  onJsonParsed: (data: unknown, rawJson: string) => void;
  onPathClick?: (path: string) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export function JsonInput({
  initialValue = "",
  onJsonParsed,
  onPathClick,
}: JsonInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [formattedJson, setFormattedJson] = useState(initialValue);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isFormatting = useRef(false);
  const isMobile = useIsMobile();

  const parseAndFormat = useCallback(
    (text: string) => {
      if (text.trim() === "") {
        setError(null);
        setFormattedJson("");
        return;
      }
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        setError(null);
        setFormattedJson(formatted);
        onJsonParsed(parsed, formatted);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    },
    [onJsonParsed]
  );

  // Mobile: plain textarea for reliable paste
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
          <span className="text-sm font-medium text-neutral-400">
            JSON Input
          </span>
          {error && (
            <span className="text-sm text-red-400 truncate ml-4">{error}</span>
          )}
        </div>
        <textarea
          className="flex-1 w-full p-4 bg-transparent text-base font-mono text-neutral-200 resize-none focus:outline-none placeholder:text-neutral-600"
          placeholder="Paste JSON here..."
          value={formattedJson}
          onChange={(e) => {
            setFormattedJson(e.target.value);
            // Only parse on valid JSON, don't reformat while typing
            try {
              const parsed = JSON.parse(e.target.value);
              setError(null);
              onJsonParsed(parsed, e.target.value);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Invalid JSON"
              );
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text");
            parseAndFormat(pasted);
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    );
  }

  // Desktop: Monaco editor
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">JSON Input</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600">
            {"\u2318"}+click to extract path
          </span>
          {error && (
            <span className="text-sm text-red-400 truncate">{error}</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          defaultLanguage="json"
          defaultValue={initialValue}
          theme="vs-dark"
          onChange={(value) => {
            if (isFormatting.current) return;
            const text = value ?? "";
            if (text.trim() === "") {
              setError(null);
              return;
            }
            try {
              const parsed = JSON.parse(text);
              setError(null);
              onJsonParsed(parsed, text);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Invalid JSON");
            }
          }}
          onMount={(editor) => {
            editorRef.current = editor;

            editor.onDidPaste(() => {
              const text = editor.getValue();
              if (text.trim() === "") return;
              try {
                const parsed = JSON.parse(text);
                const formatted = JSON.stringify(parsed, null, 2);
                onJsonParsed(parsed, formatted);
                setError(null);
                if (formatted !== text) {
                  isFormatting.current = true;
                  editor.setValue(formatted);
                  isFormatting.current = false;
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : "Invalid JSON");
              }
            });

            editor.onMouseDown((e) => {
              if (!e.event.metaKey && !e.event.ctrlKey) return;
              if (!e.target.position) return;
              const text = editor.getValue();
              const path = jsonPathAtLine(text, e.target.position.lineNumber);
              if (path && onPathClick) {
                e.event.preventDefault();
                e.event.stopPropagation();
                onPathClick(path);
              }
            });
          }}
          options={{
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
            accessibilitySupport: "off",
          }}
        />
      </div>
    </div>
  );
}
