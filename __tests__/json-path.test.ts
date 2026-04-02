import { describe, it, expect } from "vitest";
import { jsonPathAtLine } from "@/lib/json-path";

describe("jsonPathAtLine", () => {
  const json = JSON.stringify(
    {
      users: [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ],
      meta: { count: 2 },
    },
    null,
    2
  );

  // Lines of the formatted JSON:
  // 1:  {
  // 2:    "users": [
  // 3:      {
  // 4:        "name": "Alice",
  // 5:        "age": 30,
  // 6:      },
  // 7:      {
  // 8:        "name": "Bob",
  // 9:        "age": 25
  // 10:     }
  // 11:   ],
  // 12:   "meta": {
  // 13:     "count": 2
  // 14:   }
  // 15: }

  it("returns data for root line", () => {
    expect(jsonPathAtLine(json, 1)).toBe("data");
  });

  it("returns path for top-level key opening an array", () => {
    expect(jsonPathAtLine(json, 2)).toBe("data.users");
  });

  it("returns path for nested object property", () => {
    expect(jsonPathAtLine(json, 4)).toBe("data.users[0].name");
  });

  it("returns path for second array element property", () => {
    expect(jsonPathAtLine(json, 8)).toBe("data.users[1].name");
  });

  it("returns path for nested object key", () => {
    expect(jsonPathAtLine(json, 13)).toBe("data.meta.count");
  });

  it("returns null for out of range", () => {
    expect(jsonPathAtLine(json, 0)).toBeNull();
    expect(jsonPathAtLine(json, 100)).toBeNull();
  });

  const simpleArray = JSON.stringify([10, 20, 30], null, 2);
  // 1: [
  // 2:   10,
  // 3:   20,
  // 4:   30
  // 5: ]

  it("handles root-level array elements", () => {
    expect(jsonPathAtLine(simpleArray, 2)).toBe("data[0]");
    expect(jsonPathAtLine(simpleArray, 3)).toBe("data[1]");
    expect(jsonPathAtLine(simpleArray, 4)).toBe("data[2]");
  });
});
