# CLAUDE.md

## Project Overview

**json.my** (domain: json.express) is a single-file, zero-dependency web application for querying and exploring JSON data in the browser. All HTML, CSS, and JavaScript live in `index.html`.

## Architecture

- **Single file**: Everything is in `index.html` (~1,760 lines). No build step, no bundler, no package.json.
- **Zero dependencies**: Vanilla JS, no frameworks or libraries.
- **Deployed via GitHub Pages** with CNAME pointing to `json.express`.

## Key Components (all in index.html)

- **Lenient JSON parser**: Handles trailing commas, strips `//` and `/* */` comments while preserving strings.
- **Path query engine**: Supports dot notation, array indexing (`[0]`), wildcards (`[*]`), slicing (`[0:3]`), recursive descent (`..key`), and bracket notation (`["key"]`).
- **View modes**: Result (syntax-highlighted JSON), Tree (collapsible hierarchy), TypeScript Types (auto-generated interfaces).
- **URL state**: Compresses input+query with CompressionStream/deflate, stores in URL hash for sharing.
- **Theme system**: System/Light/Dark toggle, CSS custom properties, localStorage persistence.

## Development

- **No build/test/lint commands** — open `index.html` in a browser to develop.
- **Deployment**: Push to `main` branch, GitHub Pages serves automatically.

## Coding Conventions

- Vanilla ES5+ JavaScript, no transpilation.
- DOM references cached in a `dom` object.
- HTML escaped via `escapeHtml()` to prevent XSS.
- Debounced operations for hash saving and query execution.
- Keep everything in the single `index.html` file.
