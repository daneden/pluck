"use client";

import { useState, useCallback, useRef } from "react";
import { JsonInput } from "@/components/json-input";
import { ExpressionEditor } from "@/components/expression-editor";
import { OutputPreview } from "@/components/output-preview";
import { inferTypeDeclaration } from "@/lib/infer-types";
import { evaluateExpression, type EvalResult } from "@/lib/evaluate";

export default function Home() {
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [typeDeclaration, setTypeDeclaration] = useState("");
  const [result, setResult] = useState<EvalResult | null>(null);
  const expressionRef = useRef("data");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleJsonParsed = useCallback((data: unknown) => {
    setParsedData(data);
    setTypeDeclaration(inferTypeDeclaration(data));
    // Re-evaluate current expression with new data
    const evalResult = evaluateExpression(expressionRef.current, data);
    setResult(evalResult);
  }, []);

  const handleExpressionChange = useCallback(
    (value: string) => {
      expressionRef.current = value;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (parsedData !== null) {
          setResult(evaluateExpression(value, parsedData));
        }
      }, 300);
    },
    [parsedData]
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center px-4 py-3 border-b border-neutral-800">
        <h1 className="text-lg font-semibold tracking-tight">Pluck</h1>
      </header>
      <div className="flex-1 flex min-h-0">
        {/* Left pane: JSON input */}
        <div className="w-1/2 border-r border-neutral-800">
          <JsonInput onJsonParsed={handleJsonParsed} />
        </div>

        {/* Right pane: expression + output */}
        <div className="w-1/2 flex flex-col">
          <div className="h-1/3 border-b border-neutral-800">
            <ExpressionEditor
              typeDeclaration={typeDeclaration}
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
