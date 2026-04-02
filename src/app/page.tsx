"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { JsonInput } from "@/components/json-input";
import { ExpressionEditor } from "@/components/expression-editor";
import { OutputPreview } from "@/components/output-preview";
import { inferTypeDeclaration } from "@/lib/infer-types";
import { evaluateExpression, type EvalResult } from "@/lib/evaluate";

const STORAGE_KEY_JSON = "pluck:json";
const STORAGE_KEY_EXPRESSION = "pluck:expression";

function loadStored(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [typeDeclaration, setTypeDeclaration] = useState("");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [initialJson] = useState(() => loadStored(STORAGE_KEY_JSON, ""));
  const [initialExpression] = useState(() =>
    loadStored(STORAGE_KEY_EXPRESSION, "data")
  );
  const [expressionValue, setExpressionValue] = useState<string | undefined>(
    undefined
  );
  const expressionRef = useRef(initialExpression);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Hydrate from stored JSON on mount
  useEffect(() => {
    if (initialJson) {
      try {
        const parsed = JSON.parse(initialJson);
        setParsedData(parsed);
        setTypeDeclaration(inferTypeDeclaration(parsed));
        setResult(evaluateExpression(expressionRef.current, parsed));
      } catch {
        // Stored JSON is invalid, ignore
      }
    }
  }, [initialJson]);

  const handleJsonParsed = useCallback(
    (data: unknown, rawJson: string) => {
      setParsedData(data);
      setTypeDeclaration(inferTypeDeclaration(data));
      const evalResult = evaluateExpression(expressionRef.current, data);
      setResult(evalResult);
      try {
        localStorage.setItem(STORAGE_KEY_JSON, rawJson);
      } catch {
        // Storage full or unavailable
      }
    },
    []
  );

  const handleExpressionChange = useCallback(
    (value: string) => {
      expressionRef.current = value;
      try {
        localStorage.setItem(STORAGE_KEY_EXPRESSION, value);
      } catch {
        // Storage full or unavailable
      }
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (parsedData !== null) {
          setResult(evaluateExpression(value, parsedData));
        }
      }, 300);
    },
    [parsedData]
  );

  const handlePathClick = useCallback(
    (path: string) => {
      setExpressionValue(path);
      expressionRef.current = path;
      try {
        localStorage.setItem(STORAGE_KEY_EXPRESSION, path);
      } catch {}
      if (parsedData !== null) {
        setResult(evaluateExpression(path, parsedData));
      }
    },
    [parsedData]
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center px-4 py-3 border-b border-neutral-800">
        <h1 className="text-lg font-semibold tracking-tight">Pluck</h1>
      </header>
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left pane: JSON input */}
        <div className="h-1/2 md:h-auto md:w-1/2 border-b md:border-b-0 md:border-r border-neutral-800">
          <JsonInput
            initialValue={initialJson}
            onJsonParsed={handleJsonParsed}
            onPathClick={handlePathClick}
          />
        </div>

        {/* Right pane: expression + output */}
        <div className="h-1/2 md:h-auto md:w-1/2 flex flex-col">
          <div className="h-1/3 border-b border-neutral-800">
            <ExpressionEditor
              initialValue={initialExpression}
              typeDeclaration={typeDeclaration}
              value={expressionValue}
              onChange={handleExpressionChange}
            />
          </div>
          <div className="flex-1 min-h-0">
            <OutputPreview result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
