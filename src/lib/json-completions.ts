import {
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";

/**
 * Creates a CodeMirror completion source that suggests properties
 * from the actual parsed JSON data.
 */
export function jsonCompletionSource(getData: () => unknown) {
  return (context: CompletionContext): CompletionResult | null => {
    // Match `data`, `data.foo`, `data.foo.bar`, `data[0].baz`, etc.
    // We want to complete after a dot
    const before = context.matchBefore(
      /(?:data(?:\.[a-zA-Z_$][\w$]*|\[\d+\])*)\./
    );
    if (!before) return null;

    const data = getData();
    if (data === null || data === undefined) return null;

    // Evaluate the path up to the last dot to get the target object
    const pathExpr = before.text.slice(0, -1); // remove trailing dot
    let target: unknown;
    try {
      const fn = new Function("data", `"use strict"; return (${pathExpr});`);
      target = fn(data);
    } catch {
      return null;
    }

    if (target === null || target === undefined || typeof target !== "object") {
      return null;
    }

    const options: { label: string; type: string; detail?: string }[] = [];

    if (Array.isArray(target)) {
      // Suggest array methods
      const arrayMethods = [
        "map",
        "filter",
        "find",
        "findIndex",
        "some",
        "every",
        "reduce",
        "flatMap",
        "flat",
        "forEach",
        "includes",
        "indexOf",
        "slice",
        "sort",
        "reverse",
        "join",
        "length",
      ];
      for (const method of arrayMethods) {
        options.push({
          label: method,
          type: method === "length" ? "property" : "method",
          detail:
            method === "length" ? `${target.length}` : undefined,
        });
      }
    } else {
      // Suggest object keys with type info
      for (const [key, val] of Object.entries(target)) {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
        if (!safeKey) continue; // skip keys that need bracket notation for dot completion

        let detail: string;
        if (val === null) detail = "null";
        else if (Array.isArray(val)) detail = `Array(${val.length})`;
        else detail = typeof val;

        options.push({
          label: key,
          type: typeof val === "object" ? "property" : "variable",
          detail,
        });
      }
    }

    if (options.length === 0) return null;

    return {
      from: before.to,
      options,
      validFor: /^[\w$]*$/,
    };
  };
}
