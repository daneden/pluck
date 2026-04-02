"use client";

import type { EvalResult } from "@/lib/evaluate";

interface OutputPreviewProps {
  result: EvalResult | null;
}

export function OutputPreview({ result }: OutputPreviewProps) {
  let content: React.ReactNode;

  if (result === null) {
    content = (
      <span className="text-neutral-600 italic">
        Paste JSON and write an expression to see output
      </span>
    );
  } else if (!result.success) {
    content = <span className="text-red-400 font-mono text-sm">{result.error}</span>;
  } else if (result.value === undefined) {
    content = (
      <span className="text-neutral-600 italic">No result</span>
    );
  } else {
    content = (
      <pre className="text-sm font-mono text-neutral-200 whitespace-pre-wrap break-words">
        {typeof result.value === "string"
          ? result.value
          : JSON.stringify(result.value, null, 2)}
      </pre>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">Output</span>
      </div>
      <div className="flex-1 p-4 overflow-auto">{content}</div>
    </div>
  );
}
