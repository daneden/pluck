"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vsDark } from "@/lib/theme";
import { EditorView } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { jsonCompletionSource } from "@/lib/json-completions";

interface ExpressionEditorProps {
  initialValue?: string;
  value?: string;
  parsedData: unknown;
  onChange: (value: string) => void;
}

export function ExpressionEditor({
  initialValue = "data",
  value,
  parsedData,
  onChange,
}: ExpressionEditorProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const dataRef = useRef<unknown>(parsedData);
  dataRef.current = parsedData;
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const handleChange = useCallback(
    (val: string) => {
      setInternalValue(val);
      onChange(val);
    },
    [onChange]
  );

  // Update value from parent (e.g. path click)
  const displayValue = value !== undefined ? value : internalValue;

  const extensions = useMemo(
    () => [
      javascript(),
      EditorView.lineWrapping,
      autocompletion({
        override: [jsonCompletionSource(() => dataRef.current)],
        activateOnTyping: true,
      }),
    ],
    []
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">Expression</span>
        <span className="text-xs text-neutral-600 ml-2">
          Use <code className="text-neutral-500">data</code> to reference your
          JSON
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <CodeMirror
          ref={editorRef}
          value={displayValue}
          onChange={handleChange}
          extensions={extensions}
          theme={vsDark}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          style={{ height: "100%", fontSize: "16px" }}
        />
      </div>
    </div>
  );
}
