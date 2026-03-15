---
title: JSON Dot Notation Explained with Practical Examples
description: Master JSON dot notation for accessing nested values. Learn about edge cases like keys with dots, numeric keys, and special characters.
keywords: json dot notation, access nested json, javascript dot notation json, json property access, nested json values
date: 2026-02-28
---

# JSON Dot Notation Explained with Practical Examples

Dot notation is the most common way to reference values deep inside JSON structures. If you've ever written `user.profile.avatar` or `config.database.host`, you're already using it. But there are surprising edge cases and gotchas that trip up developers.

This guide covers everything: the basics, how it maps to JavaScript, edge cases that break intuition, and when to switch to bracket notation.

## What Is Dot Notation?

Dot notation is a shorthand for accessing properties in nested objects. Instead of writing `obj['key']`, you write `obj.key`. It's readable, concise, and the standard across most programming languages.

In JSON context, it's the natural way to reference paths through hierarchical data:

```
user.name
user.address.city
user.posts[0].title
```

Each dot descends one level. Each bracket `[]` accesses an array element.

## Basic Examples

Here's a JSON structure:

```json
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    },
    "posts": [
      { "id": 1, "title": "First Post" },
      { "id": 2, "title": "Second Post" }
    ]
  }
}
```

Using dot notation:

| Path | Value |
|------|-------|
| `user.name` | `"Alice"` |
| `user.address.city` | `"New York"` |
| `user.address.zip` | `"10001"` |
| `user.posts[0].title` | `"First Post"` |
| `user.posts[1].id` | `2` |

In JavaScript, these are equivalent:

```javascript
obj.user.name === obj['user']['name']
obj.user.address.city === obj['user']['address']['city']
```

Dot notation is just syntactic sugar for bracket notation—the runtime behavior is identical.

## Array Access

Arrays use bracket notation with numeric indices:

```
users[0]        // First user
users[5]        // Sixth user
users[-1]       // Last user (not standard JS, but json.express supports it)
```

Combine with dot notation for nested access:

```
users[0].name                    // First user's name
posts[2].author.email            // Third post's author's email
data.results[0].metadata.tags[1] // Nested array access
```

## How It Maps to JavaScript

Dot notation is JavaScript native. When you write:

```javascript
user.address.city
```

The JavaScript engine:
1. Evaluates `user` → gets the object
2. Accesses the `address` property → gets the nested object
3. Accesses the `city` property → gets the value

This is equivalent to:

```javascript
user['address']['city']
```

Both throw an error if a property is missing:

```javascript
user.address.country  // undefined (address exists but no country)
user.missing.city     // TypeError: Cannot read property 'city' of undefined
```

JavaScript has optional chaining (`?.`) to handle this safely:

```javascript
user?.address?.city   // Returns undefined if any step is missing
```

## Edge Cases That Break Things

### 1. Keys Containing Dots

If your JSON key literally contains a dot, dot notation breaks:

```json
{
  "user.name": "Alice",
  "config": {
    "db.host": "localhost"
  }
}
```

This fails:
```javascript
obj.user.name  // Tries to access obj.user, then .name (wrong!)
```

Use bracket notation instead:
```javascript
obj["user.name"]        // ✓ Works: "Alice"
obj.config["db.host"]   // ✓ Works: "localhost"
```

In json.express, you'd write:
```
["user.name"]
config["db.host"]
```

### 2. Numeric Object Keys

JSON keys can be numbers (as strings). These are tricky:

```json
{
  "1": "First",
  "2": "Second",
  "users": {
    "101": { "name": "Alice" },
    "102": { "name": "Bob" }
  }
}
```

With pure dot notation, you can't access numeric keys reliably:

```javascript
obj.1           // SyntaxError: Unexpected number
obj["1"]        // ✓ Works: "First"
obj.users["101"].name  // ✓ Works: "Alice"
```

Use bracket notation for numeric keys.

### 3. Keys with Spaces, Hyphens, or Special Characters

Any key with spaces or special characters requires brackets:

```json
{
  "first name": "Alice",
  "favorite-color": "blue",
  "config@version": "2.0"
}
```

```javascript
obj.first name      // SyntaxError
obj["first name"]   // ✓ "Alice"
obj["favorite-color"]    // ✓ "blue"
obj["config@version"]    // ✓ "2.0"
```

### 4. Empty String Keys

Yes, JSON allows empty string keys:

```json
{
  "": "value",
  "name": "Alice"
}
```

```javascript
obj[""]     // ✓ "value"
obj.name    // ✓ "Alice"
```

### 5. Reserved Words as Keys

JavaScript reserves words like `class`, `function`, `return`. As keys, they're fine:

```json
{
  "class": "admin",
  "function": "process",
  "return": true
}
```

```javascript
obj.class      // ✓ "admin" (works in modern JS)
obj["class"]   // ✓ Always works
obj.return     // ✓ Works in most contexts (but not recommended)
obj["return"]  // ✓ Always works (safer)
```

Use bracket notation to be explicit and avoid issues.

## Practical Decision Tree

**Use dot notation when:**
- Keys are valid JavaScript identifiers (letters, numbers, `_`, `$`)
- Keys don't start with a number
- No spaces, hyphens, or special characters
- It's clearer and more readable

**Use bracket notation when:**
- Keys contain dots, spaces, or special characters
- Keys are numeric strings
- Keys are reserved words
- You're accessing keys dynamically (e.g., from a variable)

```javascript
const key = "user.id";
obj[key]  // Accesses obj["user.id"], not nested access
```

## How json.express Supports Both

json.express query bar accepts both styles:

```
user.name                    // Dot notation
user["address.city"]         // Bracket for keys with dots
users[0].posts[1].title      // Mixed
data["special-key"].value    // Mixed
["top-level-key"].nested     // Bracket first, then dot
```

You can switch freely based on the JSON structure. The query engine understands both and combines them seamlessly.

## Real-World Example: API Response Paths

Here's a complex API response:

```json
{
  "response": {
    "user": {
      "id": 123,
      "profile": {
        "display_name": "Alice",
        "social-media": {
          "twitter": "@alice"
        }
      }
    },
    "posts": [
      {
        "id": 1,
        "content": "Hello",
        "meta": {
          "created_at": "2026-03-10T10:00:00Z"
        }
      }
    ]
  }
}
```

Different paths you might use:

| Use Case | Path |
|----------|------|
| User ID | `response.user.id` |
| Display name | `response.user.profile.display_name` |
| Twitter handle | `response.user.profile["social-media"].twitter` |
| First post content | `response.posts[0].content` |
| Post creation time | `response.posts[0].meta.created_at` |

Notice the mix: `display_name` works with dots (it's a valid identifier), but `social-media` requires brackets because of the hyphen.

## Common Mistakes

**Mistake 1: Forgetting brackets for arrays**
```javascript
obj.posts.0.title      // ❌ Wrong
obj.posts[0].title     // ✓ Correct
```

**Mistake 2: Assuming missing properties return an error**
```javascript
obj.missing.nested.path  // ❌ TypeError if 'missing' doesn't exist
obj?.missing?.nested?.path  // ✓ Safe: returns undefined
```

**Mistake 3: Mixing styles without bracket notation for special keys**
```javascript
obj.user.favorite-color  // ❌ Interprets as (obj.user.favorite) - color
obj.user["favorite-color"]  // ✓ Correct
```

## Tips for Working with Dynamic JSON

When you don't know the structure beforehand:

1. **Explore first**: Paste into json.express and browse the Tree view to understand structure
2. **Use wildcards**: `posts[*].title` returns all post titles
3. **Use recursive descent**: `..email` finds email anywhere in the tree
4. **Test your paths**: The Result view shows what your query returns

## Summary

Dot notation is powerful and readable, but has limits. Master the edge cases:
- Use bracket notation for keys with special characters
- Numeric keys, keys with dots, spaces, hyphens—all need brackets
- Combine both styles in the same path
- Use optional chaining (`?.`) in JavaScript to handle missing properties safely

Get comfortable switching between styles. The best path is the one that works for your specific JSON structure.

Ready to explore? Head to [json.express](/query/) and try different paths on your own data.
