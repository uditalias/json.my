# json.my — Planning Document

## What Is This

A single-file, zero-backend web app that lets you paste JSON, query it with path expressions, and explore the shape of your data — all stored compressed in the URL hash so you can share it as a link.

Think of it as the JSON tool you actually want open when you’re debugging an API response. Not a formatter. A **query + explore** tool.

-----

## Core Philosophy

- Single `index.html` file. No build step, no framework, no backend.
- State lives in the URL hash (deflate-compressed). Shareable by copying the URL.
- Dark mode by default, respects `prefers-color-scheme`.
- Mobile-friendly but optimized for desktop workflow.
- Instant feedback — everything updates as you type.

-----

## Features (Priority Order)

### P0 — Must Have

1. **JSON Input Panel**
- Large textarea/contenteditable on the left side.
- Paste or type JSON. Auto-formats on paste.
- Shows parse errors inline with line number and position.
- Supports JSON with trailing commas and comments (lenient parsing) — normalize to strict JSON internally.
1. **Path Query Bar**
- Input field at the top (like a search bar / address bar).
- Supports dot notation: `data.users[0].name`
- Supports bracket notation: `data["key with spaces"]`
- Supports array wildcards: `data.users[*].name` → returns array of all user names.
- Supports array slicing: `data.users[0:3]`
- Supports deep wildcard: `data..name` (recursive descent — find all `name` keys at any depth).
- Live results as you type (debounced ~100ms).
- Show result count when result is an array.
1. **Result Panel**
- Right side panel showing the query result.
- Syntax-highlighted JSON output.
- If the result is a primitive, show it large and clear.
- If the result is an array/object, show formatted JSON.
- Show “No match” gracefully when path doesn’t resolve.
1. **URL Hash Storage**
- Compress the JSON input + current query path using deflate.
- Encode as base64url in the hash.
- Debounced save (500ms).
- On load, decompress from hash and restore state.
- Graceful fallback if hash is corrupted or empty.
1. **Keyboard Shortcuts**
- `Cmd/Ctrl+L` — Focus the query bar.
- `Cmd/Ctrl+Shift+C` — Copy result to clipboard.
- `Cmd/Ctrl+Enter` — Format/prettify the JSON input.

### P1 — Should Have

1. **TypeScript Type Generation**
- Toggle button or tab that shows the inferred TypeScript interface for the current query result.
- Handles nested objects, arrays of objects (merges shapes), optional fields (when array items differ), nullables.
- Example: querying `data.users[0]` shows `interface User { name: string; age: number; email?: string; }`.
1. **Tree View**
- Collapsible tree view of the JSON structure as an alternative to raw JSON.
- Click a node to auto-fill the query path.
- Shows type + value preview inline (e.g., `users: Array(3)`, `name: "John"`).
- Highlights nodes that match the current query.
1. **Path Autocomplete**
- As you type in the query bar, suggest available paths based on the JSON structure.
- Dropdown with available keys/indices at each level.
- Show the type of each suggestion (string, number, array[5], object{3 keys}).

### P2 — Nice to Have

1. **Size Stats**
- Show byte size of input JSON, result JSON.
- Show key count, depth, array lengths.
- Useful for understanding API response shapes.
1. **Multi-Query Mode**
- Allow multiple queries separated by newlines.
- Show results side-by-side or stacked.
- Useful for extracting multiple fields from the same JSON.
1. **jq Compatibility**
- Support a subset of jq syntax for power users.
- `.data.users[] | .name` style piping.
- This is stretch — only if the custom path engine isn’t enough.
1. **History**
- LocalStorage-based history of recent JSON inputs (just the first 100 chars as a label + the hash).
- Quick recall without re-pasting.

-----

## Technical Architecture

### Layout

```
┌─────────────────────────────────────────────────┐
│  [Query Path Bar]                    [TS] [Tree] │
├────────────────────────┬────────────────────────┤
│                        │                        │
│   JSON Input           │   Query Result         │
│   (editable)           │   (read-only)          │
│                        │                        │
│                        │                        │
│                        │                        │
├────────────────────────┴────────────────────────┤
│  Status: Valid JSON · 3.2 KB · Depth 4          │
└─────────────────────────────────────────────────┘
```

On mobile: stacked vertically (input on top, result below, query bar sticky at top).

### Tech Stack

- **Zero dependencies from CDN.** Everything is vanilla JS in a single HTML file.
- Syntax highlighting: custom minimal highlighter (just colorize strings/numbers/booleans/nulls/keys — no need for a full library).
- Compression: use the browser’s native `CompressionStream` / `DecompressionStream` API (deflate). Fallback to a tiny inline pako if needed for older browsers.
- All CSS is inline in `<style>` tags. No external stylesheets.
- Use CSS custom properties for theming (dark/light).

### Path Query Engine

Build a small custom query engine. Do NOT pull in JSONPath or jq libraries.

The engine parses a path string into segments:

```
"data.users[*].name"
→ [ {type: 'key', value: 'data'},
     {type: 'key', value: 'users'},
     {type: 'wildcard'},
     {type: 'key', value: 'name'} ]
```

Segment types:

- `key` — property access
- `index` — array index (number)
- `wildcard` — `[*]`, iterate all items
- `slice` — `[0:3]`, array slice
- `recursive` — `..`, deep descent

The engine walks the JSON tree applying each segment. Wildcards and recursive descent produce arrays of results.

### URL Compression Strategy

```javascript
// Encode
const state = JSON.stringify({ json: inputText, query: queryText });
const compressed = await compressDeflate(state);
const hash = base64UrlEncode(compressed);
window.location.hash = hash;

// Decode
const hash = window.location.hash.slice(1);
const compressed = base64UrlDecode(hash);
const state = JSON.parse(await decompressDeflate(compressed));
```

### TypeScript Type Inference

Walk the JSON value and produce a TS type string:

- `string` → `string`
- `number` → `number`
- `boolean` → `boolean`
- `null` → `null`
- Array → infer item type by merging all items. If items have different shapes, use union.
- Object → `interface` with key: type pairs. If a key is present in some array items but not others, mark as optional (`?`).

Name interfaces based on the path (e.g., querying `.users[0]` → `interface Users_Item`). For nested objects, generate multiple named interfaces.

-----

## Implementation Order (for Claude Code)

### Phase 1: Core Shell

- [ ] Create single `index.html` with the layout (split panels, query bar, status bar).
- [ ] CSS theming (dark/light with `prefers-color-scheme`).
- [ ] JSON input textarea with basic paste handling.
- [ ] Parse JSON on input, show errors.
- [ ] Basic syntax highlighting for the result panel.

### Phase 2: Query Engine

- [ ] Path parser (tokenizer for the path expression).
- [ ] Path evaluator (walk the tree).
- [ ] Support: dot notation, brackets, array index, `[*]` wildcard, `[n:m]` slicing, `..` recursive descent.
- [ ] Wire query bar → engine → result panel with debounced updates.

### Phase 3: URL State

- [ ] Implement deflate compression using `CompressionStream`.
- [ ] Base64url encode/decode.
- [ ] Save state to hash on input change (debounced 500ms).
- [ ] Restore state from hash on page load.
- [ ] Handle edge cases: empty hash, corrupted data, oversized URLs.

### Phase 4: Polish

- [ ] Keyboard shortcuts.
- [ ] Copy result to clipboard.
- [ ] Format/prettify button for input.
- [ ] Responsive layout for mobile.
- [ ] Status bar with size/depth info.

### Phase 5: Advanced Features

- [ ] TypeScript type inference engine.
- [ ] Tree view with click-to-query.
- [ ] Path autocomplete in query bar.

-----

## Design Notes

- **Font:** Use `"SF Mono", "Fira Code", "JetBrains Mono", monospace` for code areas.
- **Colors (dark mode):**
  - Background: `#0d1117` (GitHub dark style)
  - Panel bg: `#161b22`
  - Strings: `#a5d6ff`
  - Numbers: `#79c0ff`
  - Booleans: `#ff7b72`
  - Null: `#8b949e`
  - Keys: `#d2a8ff`
  - Query bar: slightly lighter background, prominent focus ring.
- **No animations** except subtle transitions on focus states. This is a tool, not a showcase.
- **Error states:** Red border on input when JSON is invalid. Inline error message with line:col reference.

-----

## What This Is NOT

- Not a JSON formatter (though it formats as a side effect).
- Not a JSON editor (you edit raw text, not a tree).
- Not a JSON schema validator.
- Not a jq clone (we support a useful subset, not the full language).

The goal is: **paste JSON, ask questions about it, share the answer as a URL.** That’s it.
