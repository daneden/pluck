"use client";

import { useCallback, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vsDark } from "@/lib/theme";
import { EditorView } from "@codemirror/view";
import { jsonPathAtLine } from "@/lib/json-path";

interface JsonInputProps {
  initialValue?: string;
  onJsonParsed: (data: unknown, rawJson: string) => void;
  onPathClick?: (path: string) => void;
}

export function JsonInput({
  initialValue = "",
  onJsonParsed,
  onPathClick,
}: JsonInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (val: string) => {
      setValue(val);
      if (val.trim() === "") {
        setError(null);
        return;
      }
      try {
        const parsed = JSON.parse(val);
        setError(null);
        onJsonParsed(parsed, val);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    },
    [onJsonParsed]
  );

  const extensions = useMemo(() => {
    const exts = [
      json(),
      EditorView.lineWrapping,
      // Handle paste: format JSON on paste
      EditorView.domEventHandlers({
        paste(event, view) {
          const text = event.clipboardData?.getData("text");
          if (!text) return false;
          try {
            const parsed = JSON.parse(text);
            const formatted = JSON.stringify(parsed, null, 2);
            event.preventDefault();
            view.dispatch({
              changes: {
                from: 0,
                to: view.state.doc.length,
                insert: formatted,
              },
            });
            setValue(formatted);
            setError(null);
            onJsonParsed(parsed, formatted);
            return true;
          } catch {
            return false; // let default paste handle it
          }
        },
      }),
    ];

    if (onPathClick) {
      exts.push(
        EditorView.domEventHandlers({
          click(event, view) {
            if (!event.metaKey && !event.ctrlKey) return false;
            const pos = view.posAtCoords({
              x: event.clientX,
              y: event.clientY,
            });
            if (pos === null) return false;
            const line = view.state.doc.lineAt(pos);
            const path = jsonPathAtLine(
              view.state.doc.toString(),
              line.number
            );
            if (path) {
              event.preventDefault();
              onPathClick(path);
              return true;
            }
            return false;
          },
        })
      );
    }

    return exts;
  }, [onJsonParsed, onPathClick]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">JSON Input</span>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs text-neutral-600">
            {"\u2318"}+click to extract path
          </span>
          {error && (
            <span className="text-sm text-red-400 truncate">{error}</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={extensions}
          theme={vsDark}
          placeholder="Paste JSON here..."
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: false,
          }}
          style={{ height: "100%", fontSize: "16px" }}
        />
      </div>
    </div>
  );
}
