"use client";

import { useCallback, useState } from "react";

interface JsonInputProps {
  onJsonParsed: (data: unknown) => void;
}

export function JsonInput({ onJsonParsed }: JsonInputProps) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setJsonText(value);
      if (value.trim() === "") {
        setError(null);
        return;
      }
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        setJsonText(formatted);
        setError(null);
        onJsonParsed(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    },
    [onJsonParsed]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      handleChange(pasted);
    },
    [handleChange]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-sm font-medium text-neutral-400">JSON Input</span>
        {error && (
          <span className="text-sm text-red-400 truncate ml-4">{error}</span>
        )}
      </div>
      <textarea
        className="flex-1 w-full p-4 bg-transparent text-sm font-mono text-neutral-200 resize-none focus:outline-none placeholder:text-neutral-600"
        placeholder="Paste JSON here..."
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={handlePaste}
        spellCheck={false}
      />
    </div>
  );
}
