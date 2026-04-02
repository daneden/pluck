"use client";

import { useCallback, useEffect, useRef } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface ExpressionEditorProps {
  typeDeclaration: string;
  onChange: (value: string) => void;
}

export function ExpressionEditor({
  typeDeclaration,
  onChange,
}: ExpressionEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const libDisposableRef = useRef<{ dispose: () => void } | null>(null);

  const handleMount: OnMount = useCallback(
    (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco;

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        allowJs: true,
        strict: false,
        noEmit: true,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });

      _editor.focus();
    },
    []
  );

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    libDisposableRef.current?.dispose();
    if (typeDeclaration) {
      libDisposableRef.current =
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          typeDeclaration,
          "file:///data.d.ts"
        );
    }

    return () => {
      libDisposableRef.current?.dispose();
    };
  }, [typeDeclaration]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">
          Expression
        </span>
        <span className="text-xs text-neutral-600 ml-2">
          Use <code className="text-neutral-500">data</code> to reference your JSON
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          defaultLanguage="typescript"
          defaultValue="data"
          path="file:///expression.ts"
          theme="vs-dark"
          onChange={(value) => onChange(value ?? "")}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: "off",
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 14,
            fontFamily: "monospace",
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "hidden",
              horizontal: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
