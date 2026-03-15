---
title: Exploring package.json — Querying Your Node.js Project Metadata
description: Use JSON querying to quickly inspect dependencies, scripts, and metadata in package.json files. Practical examples for everyday Node.js development.
keywords: package.json, node.js package json, npm dependencies, query package json, inspect package json, npm scripts
date: 2026-02-20
---

# Exploring package.json — Querying Your Node.js Project Metadata

Every Node.js project starts with `package.json`. It's the manifest for your application — dependencies, scripts, metadata, build configuration, and more. In small projects, it's easy to scan. In large monorepos or mature applications, it becomes a 200-line file where finding what you need takes real effort.

Here's how to use JSON querying to extract exactly what you need from `package.json` files.

## Inspecting Dependencies

A typical production `package.json` has dozens of dependencies. To see just your production deps:

```json
{
  "name": "my-web-app",
  "version": "2.4.1",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "zod": "^3.22.4",
    "pino": "^8.16.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "prettier": "^3.2.4",
    "tsx": "^4.7.0"
  }
}
```

Query `dependencies` to see just the runtime deps. Query `devDependencies` to see tooling. This is especially useful when reviewing a new project — you can quickly understand the tech stack without scrolling through the entire file.

## Listing All Scripts

In mature projects, the `scripts` section grows large:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && node scripts/build.mjs",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "db:migrate": "node scripts/migrate.mjs",
    "db:seed": "node scripts/seed.mjs",
    "db:reset": "node scripts/migrate.mjs --fresh && node scripts/seed.mjs",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "deploy:staging": "node scripts/deploy.mjs --env staging",
    "deploy:production": "node scripts/deploy.mjs --env production"
  }
}
```

Query `scripts` and you get a clean view of every available command. No need to open the file and scroll past dependencies, engine requirements, and other sections.

## Checking Specific Configuration

Many tools store their config inside `package.json` rather than in separate files. ESLint, Prettier, Jest, Babel — they all support `package.json` configuration:

```json
{
  "name": "my-app",
  "prettier": {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  },
  "eslintConfig": {
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    "rules": {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": "warn"
    }
  }
}
```

Query `prettier` or `eslintConfig.rules` to inspect specific tool configurations without noise from the rest of the file.

## Comparing Versions Across Projects

When you're maintaining multiple services, you need to check if dependencies are aligned. Copy `dependencies` from one `package.json` and `dependencies` from another, then use the [Compare](/compare/) tool to see which packages differ and which versions are out of sync.

This is especially valuable for:

- Monorepo packages that should share dependency versions
- Microservices that need compatible library versions
- Upgrading a library across multiple projects

## Inspecting Lock Files

`package-lock.json` files are notoriously large — thousands of lines. You almost never read them directly, but sometimes you need to check the exact resolved version of a transitive dependency.

Use recursive descent: `..node_modules..lodash` finds every resolved instance of lodash in the dependency tree. Or query `packages["node_modules/lodash"].version` for the top-level resolved version.

## Workspace Queries in Monorepos

In npm/yarn/pnpm workspaces, the root `package.json` defines the workspace structure:

```json
{
  "name": "monorepo",
  "private": true,
  "workspaces": [
    "packages/core",
    "packages/api",
    "packages/web",
    "packages/shared"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

Query `workspaces` to see all packages at a glance. In tools like Turborepo or Nx, the workspace config gets more complex — json.express's Tree view helps navigate the dependency graph configuration without getting lost.

## Quick Reference

Here are the most useful queries for `package.json` exploration:

- `name` — project name
- `version` — current version
- `scripts` — all available npm scripts
- `dependencies` — production dependencies
- `devDependencies` — development dependencies
- `engines` — required Node.js/npm versions
- `peerDependencies` — peer dependency requirements
- `exports` — package entry points (ESM/CJS)

Each of these pulls out exactly the section you need from even the largest `package.json` files. It's faster than opening the file and scrolling, and cleaner than piping `cat package.json | jq '.scripts'` in the terminal.
