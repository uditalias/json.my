---
title: How to Handle JSON with Comments — A Complete Guide
description: Standard JSON doesn't allow comments, but many tools use JSONC. Learn how json.express handles comments and trailing commas in JSON.
keywords: json with comments, jsonc, json comments parser, trailing comma json, json comment syntax
date: 2026-03-05
---

# How to Handle JSON with Comments — A Complete Guide

JSON is everywhere in modern development—from API responses to configuration files to data storage. Yet there's a persistent friction point: **the JSON specification explicitly forbids comments**. This creates real problems when developers need to annotate configuration files or explain complex data structures.

You've probably encountered this frustration. You're editing a `tsconfig.json` or `.vscode/settings.json`, and you want to add a comment explaining why a specific setting exists. Standard JSON rejects it. You're forced to delete the comment, leaving your colleagues confused about your intent.

This guide explains why JSON lacks comments, introduces JSONC (JSON with Comments) as a practical solution, and shows how modern tools like json.express handle the comment-parsing problem.

## Why Doesn't JSON Allow Comments?

This question has a straightforward answer: **intentional simplicity**.

When Douglas Crockford designed JSON in the early 2000s, he deliberately excluded comments. The rationale was philosophical: JSON was designed to be a minimal data interchange format that any programming language could parse with a simple, fast parser. Comments would add complexity and ambiguity.

From a pure data-interchange perspective, this makes sense. If you're sending JSON over an API, comments serve no purpose—they'd just waste bandwidth. The receiving system doesn't need them.

However, **configuration files and human-edited JSON are different beasts**. Humans benefit enormously from annotations explaining why a setting exists, what values are acceptable, or what impact changing it has. Yet strict JSON doesn't allow this.

This tension between the specification and real-world usage has driven creative solutions over the past two decades.

## The Real-World Problem: Configuration File Comments

Consider this scenario: You're maintaining a large TypeScript project's `tsconfig.json`. The configuration is critical, but it's cryptic without documentation:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

What's not obvious from this configuration:

- Why is `skipLibCheck` set to true? (Performance trade-off)
- Why `bundler` for module resolution? (Because we're using a modern bundler)
- What does `esModuleInterop` actually do? (Helps with CommonJS interop)

**Ideally, you'd add comments:**

```json
{
  "compilerOptions": {
    // ES2020 for modern browser support
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "jsx": "react-jsx",
    // Strict null checking catches common bugs early
    "strict": true,
    // Required for CommonJS library compatibility
    "esModuleInterop": true,
    // Skip type checking declaration files (faster builds)
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    // Use "bundler" for modern tools like Vite
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

But strict JSON doesn't allow this. And while some tools (like TypeScript's config loader) **do parse comments anyway**, it's not technically valid JSON.

## JSONC: JSON with Comments

To address this real-world need, **JSONC** emerged as a practical extension. JSONC is identical to JSON with two additions:

1. **Single-line comments** using `//`
2. **Multi-line comments** using `/* */`
3. **Trailing commas** (often grouped with comment support)

JSONC is not an official standard, but it's widely adopted:

- **Visual Studio Code** accepts JSONC in `.vscode/settings.json` and other config files
- **TypeScript** accepts comments in `tsconfig.json` and `jsconfig.json`
- **ESLint** accepts comments in `.eslintrc.json`
- **Prettier** accepts comments in `.prettierrc.json`
- Many modern build tools (Vite, esbuild, webpack) are lenient with comments

Here's the same `tsconfig.json` as valid JSONC:

```json
{
  "compilerOptions": {
    // Target modern browsers
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],

    // React with automatic JSX transform
    "jsx": "react-jsx",

    /* Enable strict type checking:
       - null/undefined checking
       - strict property initialization
       - strict null checks
    */
    "strict": true,

    // For CommonJS interop
    "esModuleInterop": true,

    /* Performance optimization:
       Skip checking .d.ts files in node_modules
    */
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    // Modern module resolution for bundlers like Vite
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
  }
}
```

Notice the trailing commas after the last properties—JSONC allows these too, which is helpful when you're frequently adding and removing lines.

## JSONC in Popular Configuration Files

### `.vscode/settings.json`

Visual Studio Code officially supports JSONC in workspace settings:

```json
{
  // Editor settings
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // File associations
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  /* Extensions configuration
     Customize behavior of installed extensions
  */
  "javascript.updateImportsOnFileMove.enabled": "always",

  // Exclude node_modules from search
  "search.exclude": {
    "**/node_modules": true
  }
}
```

### `tsconfig.json`

TypeScript accepts comments and trailing commas in TypeScript configuration files:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],

    // Emit source maps for debugging
    "sourceMap": true,

    // Module output settings
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Strict mode catches errors early
    "strict": true,

    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
  },

  // Include source files
  "include": ["src/**/*"],

  // Exclude build artifacts and node_modules
  "exclude": ["node_modules", "dist"],
}
```

### `.eslintrc.json`

ESLint config files often include comments explaining rules:

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },

  // Extend popular shared configs
  "extends": ["eslint:recommended"],

  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },

  "rules": {
    // Disallow var, use const/let instead
    "no-var": "error",

    // Warn about unused variables
    "no-unused-vars": "warn",

    /* Require consistent spacing
       Improves code readability
    */
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
  }
}
```

## How json.express Handles Comments and Trailing Commas

This is where json.express shines for developers working with JSONC and lenient JSON parsers.

json.express includes a **lenient JSON parser** that automatically:

1. **Strips single-line comments** (`//` to end of line)
2. **Strips multi-line comments** (`/* ... */`)
3. **Allows trailing commas** after the last element in objects and arrays
4. **Preserves strings** containing comment-like syntax

The parser is smart enough not to strip comment syntax that appears inside string values. So `"url": "https://example.com"` won't be mangled, and `"regex": "//pattern"` stays intact.

**Example:**

Paste this into [json.express](/format/):

```json
{
  "app": {
    // Application name
    "name": "MyApp",

    "version": "1.0.0",

    /* Configuration options:
       - debug: enable debug logging
       - verbose: detailed output
    */
    "debug": true,
    "verbose": false,
  },

  // Server configuration
  "server": {
    "port": 3000,
    "host": "localhost",
  },
}
```

json.express parses this correctly and strips the comments, presenting clean, valid JSON. This is invaluable when:

- You're **copying configuration files** from your project and need to understand them quickly
- You want to **validate JSONC syntax** before committing to your repository
- You need to **extract specific values** from configuration files with comments
- You're **debugging** why a tool is rejecting your config (comments might be the culprit)

## Parsing Comments Yourself

If you need to handle JSONC in your own JavaScript code, several approaches exist:

### Option 1: Use a JSONC Parser Library

The `jsonc-parser` npm package handles this professionally:

```javascript
import { parse } from 'jsonc-parser';

const jsonWithComments = `{
  // This is a comment
  "key": "value",
}`;

const data = parse(jsonWithComments);
console.log(data); // { key: 'value' }
```

### Option 2: Strip Comments Before Parsing

A simple regex approach for basic cases:

```javascript
function stripComments(json) {
  // Remove single-line comments
  json = json.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments
  json = json.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove trailing commas
  json = json.replace(/,(\s*[}\]])/g, '$1');

  return json;
}

const clean = stripComments(jsonWithComments);
const data = JSON.parse(clean);
```

⚠️ **Warning:** This naive approach has edge cases. Strings containing comment-like syntax can be mangled. For production use, prefer a dedicated library.

### Option 3: Node.js Built-in (for newer versions)

Recent Node.js versions include native support for JSONC parsing via `JSON.parse()` with additional options, though this varies by version. Check your Node.js documentation for availability.

## Tools That Accept Comments (And Those That Don't)

### Tools That Natively Accept Comments

- **TypeScript** (`tsconfig.json`, `jsconfig.json`)
- **Visual Studio Code** (most `.json` config files)
- **ESLint** (`.eslintrc.json`, and related)
- **Prettier** (`.prettierrc.json`)
- **Babel** (`.babelrc`)
- **Webpack** (some configs)
- **Vite** (`vite.config.js` with comments in inline JSON)

### Tools With Strict Validation

- **Standard JSON Schema validators** (require strict JSON)
- **Most REST APIs** (expect valid JSON without comments)
- **AWS CloudFormation** (requires strict JSON)
- **Database JSON fields** (most store strict JSON)
- **Package managers** checking `package.json` (though npm/yarn are lenient)

## Best Practices for Handling JSON with Comments

1. **Be aware of tool limitations**: If a tool requires strict JSON, comments will cause parsing errors. Check documentation first.

2. **Use comments for configuration, not data interchange**: Comments belong in configuration files you edit manually, not in API responses or files exchanged between systems.

3. **Keep comments concise**: A single-line comment is usually sufficient. If you need extensive documentation, consider a separate `.md` file explaining the configuration.

4. **Comment the "why," not the "what"**:
   ```json
   // Good: explains intention
   "skipLibCheck": true,  // Performance: skip TS lib type checking

   // Bad: restates the code
   "skipLibCheck": true,  // Set skipLibCheck to true
   ```

5. **Test your configuration**: Always validate that your tools accept comments in their config files. Don't assume—verify.

6. **Maintain JSONC clarity**: Just because you *can* add a comment doesn't mean it's needed. Over-commenting makes files harder to read.

## Validation and Testing

To validate your JSONC before deploying:

1. **Use json.express**: Paste your JSONC file into the [format validator](/format/) to check syntax
2. **Use your tool's validation**: Most tools have a `--validate` or similar flag
3. **Test locally**: Try loading the config file with your tool before committing

## Summary

JSON's lack of comment support is an intentional design choice that makes sense for data interchange but causes friction in configuration files. JSONC solves this by adding single-line and multi-line comments, plus trailing commas—a practical extension that many modern tools accept.

When working with configuration files, check whether your tool supports comments. If it does, use them liberally to document why settings exist. If it doesn't, either find a tool that does or maintain separate documentation files.

For quick validation and exploration of JSONC files, **use [json.express](/validate/)** to test syntax and parse comments before committing to your project. Understanding how comments fit into your development workflow makes JSON configuration files more maintainable and your team more effective.

JSON with comments isn't a standard, but it's become a practical necessity in modern development. Embrace it where tools allow, understand its limitations where they don't, and your JSON documents—and your teammates—will be happier.
