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
