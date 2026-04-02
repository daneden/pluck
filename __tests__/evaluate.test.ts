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
