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
