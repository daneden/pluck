# Pluck — JSON Transformer

## Overview

A single-page web app for pasting JSON and transforming it with JavaScript expressions. Features VS Code-style autocomplete powered by type inference from the pasted JSON.

## Layout

Two-pane, side by side:

- **Left pane:** JSON input. Paste area that auto-formats on paste and displays syntax-highlighted JSON (read-only after formatting).
- **Right pane, top:** Monaco editor for writing a JS/TS transformation expression. Single or few lines. Autocomplete and type hints powered by types inferred from the input JSON.
- **Right pane, bottom:** Live output preview. Formatted, syntax-highlighted result that updates as the user types (debounced).

## Core Flow

1. User pastes JSON into the left pane.
2. JSON is parsed, pretty-printed, and displayed.
3. TypeScript type definitions are generated from the JSON structure and injected into Monaco as `declare const data: <InferredType>`.
4. User writes an expression (e.g. `data.users.map(u => u.name)`) with full IntelliSense.
5. The expression is evaluated client-side against the parsed JSON. Output updates live (debounced ~300ms).
6. User can copy the result.

## Type Inference

Recursively walk the parsed JSON to produce TypeScript interfaces:

- Primitives map to `string`, `number`, `boolean`, `null`.
- Objects become inline object types with each key typed.
- Arrays infer element type from the union of all elements. Empty arrays become `unknown[]`.
- Nested structures produce nested types.

The generated declaration is injected into Monaco's TypeScript language service as an extra lib, so `data.` triggers autocomplete with property names and types.

## Tech Stack

- **Next.js** (App Router) — single page app
- **@monaco-editor/react** — editor with IntelliSense
- **Tailwind CSS** — styling
- **No backend** — all transformation runs client-side via `Function` constructor

## Error Handling

- Invalid JSON on paste: show inline error message in the left pane, don't clear previous valid state.
- Expression errors (syntax, runtime): show error message in the output pane. Don't break the UI.
- Type inference failures: fall back to `any` for the problematic subtree.

## Out of Scope

- Persistence, sharing, history
- Visual/click-to-extract transformations
- Server-side evaluation
