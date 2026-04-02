"use client";

import { useCallback, useEffect, useRef } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface ExpressionEditorProps {
  initialValue?: string;
  typeDeclaration: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ExpressionEditor({
  initialValue = "data",
  typeDeclaration,
  value,
  onChange,
}: ExpressionEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const libDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const typeDeclarationRef = useRef(typeDeclaration);
  typeDeclarationRef.current = typeDeclaration;

  const injectTypes = useCallback((monaco: Monaco, declaration: string) => {
    libDisposableRef.current?.dispose();
    if (declaration) {
      libDisposableRef.current =
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          declaration,
          "file:///data.d.ts"
        );
    }
  }, []);

  const handleMount: OnMount = useCallback(
    (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco;
      editorRef.current = _editor;

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

      // Inject any type declarations that were set before mount
      if (typeDeclarationRef.current) {
        injectTypes(monaco, typeDeclarationRef.current);
      }

      _editor.focus();
    },
    [injectTypes]
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && value !== undefined && editor.getValue() !== value) {
      editor.setValue(value);
      // Move cursor to end
      const model = editor.getModel();
      if (model) {
        const lastLine = model.getLineCount();
        const lastCol = model.getLineMaxColumn(lastLine);
        editor.setPosition({ lineNumber: lastLine, column: lastCol });
      }
      editor.focus();
    }
  }, [value]);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    injectTypes(monaco, typeDeclaration);
    return () => {
      libDisposableRef.current?.dispose();
    };
  }, [typeDeclaration, injectTypes]);

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
          defaultValue={initialValue}
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
            fontSize: 16,
            fontFamily: "monospace",
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            accessibilitySupport: "off",
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
