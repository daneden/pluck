/**
 * Given pretty-printed JSON (from JSON.stringify with indent 2) and a
 * 1-based line number, returns the `data.x.y.z` accessor path for that line.
 */
export function jsonPathAtLine(jsonText: string, line: number): string | null {
  const lines = jsonText.split("\n");
  if (line < 1 || line > lines.length) return null;

  // Track the path stack by scanning from top to the target line.
  // Each entry: { key: string | number, isArray: boolean }
  const stack: { key: string | number | null; isArray: boolean }[] = [];
  const arrayIndices: number[] = []; // tracks current index per array depth

  for (let i = 0; i < line; i++) {
    const l = lines[i].trim();

    // Opening a new object or array at root level
    if (i === 0 && (l === "{" || l === "[")) {
      stack.push({ key: null, isArray: l === "[" });
      if (l === "[") arrayIndices.push(0);
      continue;
    }

    // Key-value pair: "key": ...
    const keyMatch = l.match(/^"([^"]*)":\s*(.*)/);
    if (keyMatch) {
      const key = keyMatch[1];
      const rest = keyMatch[2];

      // If the value opens an object or array
      if (rest === "{" || rest === "[") {
        stack.push({ key, isArray: rest === "[" });
        if (rest === "[") arrayIndices.push(0);
      } else {
        // Primitive value — set key for this line, will be read if this is target
        // Push temporarily for the target line check
        if (i === line - 1) {
          stack.push({ key, isArray: false });
        }
      }
      continue;
    }

    // Array element (not a key-value pair, inside an array)
    if (stack.length > 0 && stack[stack.length - 1].isArray) {
      if (l === "{" || l === "[") {
        const idx = arrayIndices[arrayIndices.length - 1];
        stack.push({ key: idx, isArray: l === "[" });
        if (l === "[") arrayIndices.push(0);
        continue;
      }

      // Closing bracket
      if (l === "}" || l === "}," || l === "]" || l === "],") {
        if (l.startsWith("}") || l.startsWith("]")) {
          stack.pop();
          if (l.startsWith("]")) arrayIndices.pop();
          // After closing an element in an array, increment the parent array index
          if (
            stack.length > 0 &&
            stack[stack.length - 1].isArray &&
            l.endsWith(",")
          ) {
            arrayIndices[arrayIndices.length - 1]++;
          }
        }
        continue;
      }

      // Primitive array element
      if (i === line - 1) {
        const idx = arrayIndices[arrayIndices.length - 1];
        stack.push({ key: idx, isArray: false });
      }
      // Increment index on comma
      if (l.endsWith(",")) {
        arrayIndices[arrayIndices.length - 1]++;
      }
      continue;
    }

    // Closing bracket for objects
    if (l === "}" || l === "}," || l === "]" || l === "],") {
      stack.pop();
      if (l.startsWith("]")) arrayIndices.pop();
      if (
        stack.length > 0 &&
        stack[stack.length - 1].isArray &&
        l.endsWith(",")
      ) {
        arrayIndices[arrayIndices.length - 1]++;
      }
    }
  }

  // Build path from stack
  const segments: (string | number)[] = [];
  for (const entry of stack) {
    if (entry.key !== null) {
      segments.push(entry.key);
    }
  }

  if (segments.length === 0) return "data";

  let result = "data";
  for (const seg of segments) {
    if (typeof seg === "number") {
      result += `[${seg}]`;
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
      result += `.${seg}`;
    } else {
      result += `["${seg}"]`;
    }
  }
  return result;
}
