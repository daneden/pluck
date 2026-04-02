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
      if (typeof value === "object")
        return inferObjectType(value as Record<string, unknown>);
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
