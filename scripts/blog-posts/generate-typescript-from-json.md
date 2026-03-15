---
title: Generate TypeScript Types from JSON in Seconds
description: Learn how to automatically generate TypeScript interfaces from JSON data. Covers nested objects, arrays, union types, and optional properties.
keywords: json to typescript, generate typescript interfaces, json to ts online, typescript from json, json type generator
date: 2026-03-03
---

# Generate TypeScript Types from JSON in Seconds

If you've ever received a JSON API response and spent thirty minutes writing TypeScript interfaces by hand, you know the pain. Every nested object means another `interface`. Every optional field requires `?`. Every array of objects requires type inference and merging. It's tedious, error-prone, and exactly the kind of work that computers should handle.

This is where JSON-to-TypeScript generation comes in—and it's a game-changer for type-safe development.

## Why Type Safety Matters with JSON APIs

JSON APIs return untyped data. When you fetch from an endpoint, you get a plain JavaScript object with no shape guarantees. Without types, you're vulnerable to:

- **Runtime errors**: Accessing a property that doesn't exist (`user.adress` instead of `user.address`) fails silently until runtime
- **IDE limitations**: No autocomplete, no inline documentation, no error detection
- **Refactoring risks**: Rename a field in the backend, and your frontend breaks without warning
- **Developer friction**: Manual type definitions become outdated when APIs evolve

TypeScript solves this, but only if you have accurate interfaces. Manual interface writing is the bottleneck.

## The Manual Pain

Here's what manual TypeScript typing looks like. Suppose you fetch a user response:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "profile": {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software engineer",
    "following": 42,
    "followers": null
  },
  "posts": [
    {
      "id": 101,
      "title": "TypeScript Tips",
      "published": true,
      "tags": ["typescript", "web"]
    }
  ],
  "metadata": {
    "createdAt": "2025-01-15T10:30:00Z",
    "lastLogin": null
  }
}
```

Writing this by hand:

```typescript
interface Profile {
  avatar: string;
  bio: string;
  following: number;
  followers: null;  // or number | null?
}

interface Post {
  id: number;
  title: string;
  published: boolean;
  tags: string[];
}

interface Metadata {
  createdAt: string;
  lastLogin: null;  // or string | null?
}

interface User {
  id: number;
  name: string;
  email: string;
  profile: Profile;
  posts: Post[];
  metadata: Metadata;
}
```

You have to:
- Spot every nested object and create an interface for it
- Infer types from values (is `followers: null` actually `number | null`?)
- Decide whether fields are optional
- Keep everything in sync as the API evolves

Multiply this by dozens of endpoints and you're spending hours on boilerplate.

## How json.express Auto-Generates TypeScript

With json.express, the workflow is:

1. **Paste your JSON** into the input panel
2. **Click the TypeScript view** (or use the view toggle)
3. **Copy the generated interfaces**
4. **Paste into your codebase**

That's it. No waiting, no manual work.

### What Gets Generated

json.express analyzes your JSON and:

**Nested objects** → Creates separate interfaces with proper relationships:
```typescript
interface Profile {
  avatar: string;
  bio: string;
  following: number;
  followers: null;
}

interface User {
  profile: Profile;
  // ... other fields
}
```

**Arrays of objects** → Merges properties intelligently. If you have an array like:
```json
[
  { "id": 1, "name": "Alice", "role": "admin" },
  { "id": 2, "name": "Bob" },
  { "id": 3, "name": "Charlie", "role": "user" }
]
```

It generates:
```typescript
interface Item {
  id: number;
  name: string;
  role?: string;  // Optional because not all items have it
}
```

Notice `role?` — the generator recognizes that not every object includes it, so it marks the field optional.

**Union types** → When a field can be different types:
```typescript
followers: number | null;
tags: string[] | null;
```

**Optional properties** → Fields missing from some objects get `?`:
```typescript
interface Post {
  id: number;
  title: string;
  published?: boolean;  // Not in every post
}
```

## Real-World Example: API Response

Let's say you're building a social feed and fetch:

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "author": {
          "id": 101,
          "name": "Alice",
          "avatar": "https://..."
        },
        "content": "Check this out",
        "likes": 234,
        "comments": [
          {
            "id": 1001,
            "author": "Bob",
            "text": "Great!"
          }
        ],
        "published": "2026-03-10T14:22:00Z",
        "edited": null
      }
    ],
    "nextPage": "page=2"
  }
}
```

json.express generates:

```typescript
interface Comment {
  id: number;
  author: string;
  text: string;
}

interface Author {
  id: number;
  name: string;
  avatar: string;
}

interface Post {
  id: number;
  author: Author;
  content: string;
  likes: number;
  comments: Comment[];
  published: string;
  edited: null;
}

interface Data {
  posts: Post[];
  nextPage: string;
}

interface Root {
  success: boolean;
  data: Data;
}
```

Then in your React/Vue/Svelte code:

```typescript
const response = await fetch('/api/feed');
const data: Root = await response.json();

// Now fully typed:
data.data.posts[0].author.name  // ✓ autocomplete, type-safe
data.data.posts[0].likes        // ✓ knows it's a number
```

## Comparison with Other Tools

**quicktype.io** — Generates code for many languages (C#, Go, Rust, etc.), offers more customization, but requires an account for some features. Better for multi-language projects.

**json2ts.com** — Similar to json.express, generates TypeScript interfaces. Slightly less aggressive about inferring optional fields.

**json.express** — Specialized for JSON querying and exploration. Generation is a built-in feature (not the whole product). No accounts, no friction—paste and go. Best for quick conversions and when you're already exploring JSON in the tool.

## Limitations to Know

The generator makes educated guesses:
- **Null fields**: `followers: null` becomes `null` (not `number | null`). If you need to handle the actual type, you may need manual adjustments.
- **String-like data**: Dates and UUIDs are inferred as `string`, not `Date` or branded types.
- **Edge cases**: Highly polymorphic data (where the same field holds wildly different types) may need refinement.

For 80% of API responses, the output is production-ready. For the other 20%, it saves you 80% of the typing.

## Workflow Tips

**1. Use it early in development**
When designing your API, paste example responses into json.express to generate types. Share these with your team before implementation.

**2. Regenerate after API changes**
When your backend adds optional fields, regenerate and do a diff to catch breaking changes.

**3. Combine with actual API documentation**
The generator is smart, but API docs tell you intent. A field might always be present in practice even if it's `null` sometimes—docs clarify this.

**4. Extend for real-world needs**
Generated code is a starting point. Add readonly modifiers, stricter unions, branded types, and validation as needed:

```typescript
interface User extends Root {
  readonly id: number;  // added readonly
  followers: number;    // changed from null after reviewing docs
}
```

## Get Started

Head to [json.express](/typescript/) and try it:

1. Paste a JSON response from your API
2. Switch to the TypeScript view
3. Copy the generated interfaces
4. Import and use them in your codebase

The TypeScript view is available alongside Result and Tree views, giving you instant access to type generation without leaving your browser.

Stop writing boilerplate. Let the machine handle it.
