# Pluck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app that lets users paste JSON, explore it formatted, and transform it with JS expressions using Monaco editor with type-inferred autocomplete.

**Architecture:** Single page with three panels — JSON input (left), expression editor (right top), output preview (right bottom). Type inference generates TypeScript declarations from pasted JSON and injects them into Monaco's language service. Expression evaluation runs client-side via `Function` constructor with debounced live updates.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, `@monaco-editor/react` 4.x

---

## File Structure

```
pluck/
├── src/
│   ├── app/
│   │   ├── layout.tsx          — Root layout, fonts, metadata
│   │   ├── page.tsx            — Main page, composes panels
│   │   └── globals.css         — Tailwind base + custom styles
│   ├── components/
│   │   ├── json-input.tsx      — Left pane: paste area + formatted JSON display
│   │   ├── expression-editor.tsx — Right top: Monaco editor for transform expression
│   │   └── output-preview.tsx  — Right bottom: formatted transform result
│   └── lib/
│       ├── infer-types.ts      — Generate TS declarations from parsed JSON
│       └── evaluate.ts         — Safely evaluate expression against JSON data
├── __tests__/
│   ├── infer-types.test.ts     — Type inference tests
│   └── evaluate.test.ts        — Expression evaluation tests
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: entire project scaffold via CLI
- Modify: `package.json` (add Monaco dependency)

- [ ] **Step 1: Create Next.js app**

```bash
cd /Users/dte/Developer
npx create-next-app@latest pluck --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --yes
```

- [ ] **Step 2: Install Monaco editor**

```bash
cd /Users/dte/Developer/pluck
npm install @monaco-editor/react
```

- [ ] **Step 3: Install test dependencies**

```bash
cd /Users/dte/Developer/pluck
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify scaffold works**

```bash
cd /Users/dte/Developer/pluck
npm run build
```

Expected: successful build.

- [ ] **Step 6: Commit**

```bash
cd /Users/dte/Developer/pluck
git add -A
git commit -m "chore: scaffold Next.js project with Monaco and Vitest"
```

---

### Task 2: Type Inference from JSON

**Files:**
- Create: `src/lib/infer-types.ts`
- Test: `__tests__/infer-types.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/infer-types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { inferTypeDeclaration } from "@/lib/infer-types";

describe("inferTypeDeclaration", () => {
  it("infers primitives", () => {
    expect(inferTypeDeclaration(42)).toBe("declare const data: number;");
    expect(inferTypeDeclaration("hello")).toBe("declare const data: string;");
    expect(inferTypeDeclaration(true)).toBe("declare const data: boolean;");
    expect(inferTypeDeclaration(null)).toBe("declare const data: null;");
  });

  it("infers flat object", () => {
    const result = inferTypeDeclaration({ name: "Alice", age: 30 });
    expect(result).toBe(
      'declare const data: { "name": string; "age": number };'
    );
  });

  it("infers nested object", () => {
    const result = inferTypeDeclaration({ user: { name: "Alice" } });
    expect(result).toBe(
      'declare const data: { "user": { "name": string } };'
    );
  });

  it("infers array of primitives", () => {
    const result = inferTypeDeclaration([1, 2, 3]);
    expect(result).toBe("declare const data: number[];");
  });

  it("infers array of objects", () => {
    const result = inferTypeDeclaration([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
    expect(result).toBe(
      'declare const data: { "name": string; "age": number }[];'
    );
  });

  it("infers empty array as unknown[]", () => {
    const result = inferTypeDeclaration([]);
    expect(result).toBe("declare const data: unknown[];");
  });

  it("infers mixed-type array as union", () => {
    const result = inferTypeDeclaration([1, "two", true]);
    expect(result).toBe("declare const data: (number | string | boolean)[];");
  });

  it("handles array of objects with different keys as union", () => {
    const result = inferTypeDeclaration([
      { name: "Alice" },
      { age: 30 },
    ]);
    expect(result).toBe(
      'declare const data: ({ "name": string } | { "age": number })[];'
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/dte/Developer/pluck
npx vitest run __tests__/infer-types.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement type inference**

Create `src/lib/infer-types.ts`:

```typescript
export function inferTypeDeclaration(value: unknown): string {
  const type = inferType(value);
  return `declare const data: ${type};`;
}

function inferType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return inferArrayType(value);

  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      if (typeof value === "object") return inferObjectType(value as Record<string, unknown>);
      return "unknown";
  }
}

function inferArrayType(arr: unknown[]): string {
  if (arr.length === 0) return "unknown[]";

  const elementTypes = arr.map(inferType);
  const unique = [...new Set(elementTypes)];

  if (unique.length === 1) return `${unique[0]}[]`;
  return `(${unique.join(" | ")})[]`;
}

function inferObjectType(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return "Record<string, unknown>";

  const fields = entries
    .map(([key, val]) => `"${key}": ${inferType(val)}`)
    .join("; ");

  return `{ ${fields} }`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/dte/Developer/pluck
npx vitest run __tests__/infer-types.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/lib/infer-types.ts __tests__/infer-types.test.ts
git commit -m "feat: add type inference from JSON values"
```

---

### Task 3: Expression Evaluator

**Files:**
- Create: `src/lib/evaluate.ts`
- Test: `__tests__/evaluate.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/evaluate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { evaluateExpression } from "@/lib/evaluate";

describe("evaluateExpression", () => {
  it("returns the data itself for 'data'", () => {
    const result = evaluateExpression("data", { name: "Alice" });
    expect(result).toEqual({ success: true, value: { name: "Alice" } });
  });

  it("accesses nested properties", () => {
    const result = evaluateExpression("data.user.name", {
      user: { name: "Alice" },
    });
    expect(result).toEqual({ success: true, value: "Alice" });
  });

  it("maps over arrays", () => {
    const result = evaluateExpression(
      "data.users.map(u => u.name)",
      { users: [{ name: "Alice" }, { name: "Bob" }] }
    );
    expect(result).toEqual({ success: true, value: ["Alice", "Bob"] });
  });

  it("handles filter and map chain", () => {
    const result = evaluateExpression(
      "data.filter(n => n > 2).map(n => n * 10)",
      [1, 2, 3, 4]
    );
    expect(result).toEqual({ success: true, value: [30, 40] });
  });

  it("returns error for syntax errors", () => {
    const result = evaluateExpression("data.{invalid", { a: 1 });
    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("returns error for runtime errors", () => {
    const result = evaluateExpression("data.foo.bar.baz", { foo: null });
    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("returns empty expression as empty result", () => {
    const result = evaluateExpression("", { a: 1 });
    expect(result).toEqual({ success: true, value: undefined });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/dte/Developer/pluck
npx vitest run __tests__/evaluate.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement expression evaluator**

Create `src/lib/evaluate.ts`:

```typescript
export type EvalResult =
  | { success: true; value: unknown }
  | { success: false; error: string };

export function evaluateExpression(
  expression: string,
  data: unknown
): EvalResult {
  const trimmed = expression.trim();
  if (trimmed === "") return { success: true, value: undefined };

  try {
    const fn = new Function("data", `"use strict"; return (${trimmed});`);
    const value = fn(data);
    return { success: true, value };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/dte/Developer/pluck
npx vitest run __tests__/evaluate.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/lib/evaluate.ts __tests__/evaluate.test.ts
git commit -m "feat: add safe expression evaluator"
```

---

### Task 4: JSON Input Component

**Files:**
- Create: `src/components/json-input.tsx`
- Modify: `src/app/globals.css` (minimal custom styles)

- [ ] **Step 1: Create the JSON input component**

Create `src/components/json-input.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/components/json-input.tsx
git commit -m "feat: add JSON input component with auto-formatting"
```

---

### Task 5: Expression Editor with Monaco + Type Injection

**Files:**
- Create: `src/components/expression-editor.tsx`

- [ ] **Step 1: Create the expression editor component**

Create `src/components/expression-editor.tsx`:

```tsx
"use client";

import { useCallback, useRef } from "react";
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
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco;

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowJs: true,
        strict: false,
        noEmit: true,
      });

      updateTypeDeclaration(monaco, typeDeclaration);

      editor.focus();
    },
    [typeDeclaration]
  );

  const updateTypeDeclaration = useCallback(
    (monaco: Monaco, declaration: string) => {
      libDisposableRef.current?.dispose();
      if (declaration) {
        libDisposableRef.current =
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            declaration,
            "file:///data.d.ts"
          );
      }
    },
    []
  );

  // Update type declarations when they change
  if (monacoRef.current && typeDeclaration) {
    updateTypeDeclaration(monacoRef.current, typeDeclaration);
  }

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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/components/expression-editor.tsx
git commit -m "feat: add Monaco expression editor with type injection"
```

---

### Task 6: Output Preview Component

**Files:**
- Create: `src/components/output-preview.tsx`

- [ ] **Step 1: Create the output preview component**

Create `src/components/output-preview.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/components/output-preview.tsx
git commit -m "feat: add output preview component"
```

---

### Task 7: Compose Main Page

**Files:**
- Modify: `src/app/page.tsx` (replace scaffold content)
- Modify: `src/app/layout.tsx` (update metadata)
- Modify: `src/app/globals.css` (dark theme base)

- [ ] **Step 1: Update globals.css**

Replace the contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #e5e5e5;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 2: Update layout.tsx metadata**

Replace the contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pluck",
  description: "Paste JSON. Transform it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create main page**

Replace the contents of `src/app/page.tsx` with:

```tsx
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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
```

- [ ] **Step 4: Verify the app builds**

```bash
cd /Users/dte/Developer/pluck
npm run build
```

Expected: successful build.

- [ ] **Step 5: Commit**

```bash
cd /Users/dte/Developer/pluck
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: compose main page with all panels"
```

---

### Task 8: Smoke Test and Polish

- [ ] **Step 1: Run all tests**

```bash
cd /Users/dte/Developer/pluck
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Start dev server and manual test**

```bash
cd /Users/dte/Developer/pluck
npm run dev
```

Manual test checklist:
1. Paste `{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}]}` — should auto-format
2. Type `data.users.map(u => u.name)` — autocomplete should suggest `users`, then `name`/`age` on `u.`
3. Output should show `["Alice", "Bob"]`
4. Type invalid expression — should show error in output, not crash

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit**

```bash
cd /Users/dte/Developer/pluck
git add -A
git commit -m "chore: final polish and cleanup"
```
