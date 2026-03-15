---
title: JSON Config Files — Patterns, Pitfalls, and Validation
description: Practical guide to using JSON for application configuration. Covers common patterns, environment-specific configs, validation strategies, and mistakes to avoid.
keywords: json config file, json configuration, app config json, json settings file, config validation, environment config json
date: 2026-03-05
---

# JSON Config Files — Patterns, Pitfalls, and Validation

JSON is everywhere in configuration: `tsconfig.json`, `.eslintrc.json`, `manifest.json`, Firebase configs, Terraform state, Docker Compose (yes, YAML is a superset of JSON). Whether you're designing a config schema for your own app or debugging someone else's, there are patterns worth knowing and traps worth avoiding.

## The Anatomy of a Good Config File

A well-structured config file groups related settings, uses sensible defaults, and is easy to scan. Here's an example for a typical web service:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "cors": {
      "origins": ["https://app.example.com"],
      "credentials": true
    }
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "redis": {
    "url": "redis://localhost:6379",
    "ttl": 3600
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destinations": ["stdout", "file"]
  },
  "features": {
    "newDashboard": false,
    "betaApi": true
  }
}
```

Notice the grouping: server settings together, database settings together, feature flags in their own section. You can query any section in isolation — `database.pool` gives you just the pool config, `features` gives you all flags.

## Environment-Specific Configs

A common pattern is to have a base config and environment overrides:

```json
{
  "base": {
    "server": { "port": 3000 },
    "logging": { "level": "info" },
    "features": { "betaApi": false }
  },
  "development": {
    "database": { "host": "localhost", "name": "myapp_dev" },
    "logging": { "level": "debug" }
  },
  "production": {
    "database": { "host": "db.internal", "name": "myapp_prod" },
    "server": { "port": 8080 },
    "logging": { "level": "warn" }
  }
}
```

You can use json.express queries to inspect what a specific environment will look like. Query `production` to see just the production overrides, or use the Compare tool to diff `development` vs `production` side by side.

## Common Pitfalls

**Trailing commas.** Standard JSON doesn't allow them. This is invalid:

```json
{
  "port": 3000,
  "host": "localhost",
}
```

Many developers hit this constantly when editing config files by hand. json.express uses a lenient parser that handles trailing commas, so you can paste in broken configs and still explore them — but you should fix them before committing.

**Comments.** JSON has no comment syntax. You can't do this:

```json
{
  // Listen on all interfaces
  "host": "0.0.0.0",
  "port": 3000
}
```

Some tools (TypeScript's `tsconfig.json`, VS Code's `settings.json`) support JSONC — JSON with comments. If you need to explore a JSONC file, json.express strips comments before parsing, so it works out of the box. See our post on [JSON with Comments](/blog/json-with-comments/) for more on this.

**Deeply nested configs.** When configs get four or five levels deep, they become hard to reason about. If you find yourself writing `config.server.middleware.rateLimit.sliding.windowMs`, it might be time to flatten.

**Secrets in config files.** Never put API keys, database passwords, or tokens directly in JSON config files that get committed to version control. Use environment variables or a secrets manager, and reference them by name:

```json
{
  "database": {
    "host": "localhost",
    "password": "$DATABASE_PASSWORD"
  }
}
```

## Validating Config Files

Before your app even starts, validate the config. Here's a pattern: generate TypeScript types from your config JSON using json.express's TypeScript tab, then use those types in your application code:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  }
}
```

Paste this in, switch to the TypeScript tab, and you get interfaces that match the actual shape. Use those as the source of truth for validation at startup — if the loaded config doesn't match the type, fail fast with a clear error.

## Exploring Large Config Files

Some configs are huge — Terraform state files, Firebase remote config exports, large `package.json` dependency trees. When you need to find something specific:

Use **recursive descent** (`..key`) to search for a field name anywhere in the tree. For example, if you're looking for every `timeout` setting across a complex config, `..timeout` finds them all regardless of nesting depth.

Use **the Tree view** to collapse sections you don't care about and focus on the section that matters.

Use **bracket notation** for keys with special characters: `["@scope/package"]` or `["some.dotted.key"]`.

## A Note on Alternatives

JSON isn't always the best choice for config. YAML supports comments natively and is more readable for deeply nested structures. TOML is great for flat configs. `.env` files work well for secrets and environment-specific values.

But JSON has a huge advantage: tooling. Every language has a built-in JSON parser. There's no ambiguity in parsing (unlike YAML's implicit typing). And tools like json.express let you query, validate, and explore config files interactively — something that's harder with other formats.

If your config is JSON, lean into it. Structure it well, validate it early, and use the right tools to inspect it when things go wrong.
