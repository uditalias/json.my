---
title: How to Query Nested JSON Objects Online
description: Learn how to use dot notation, wildcards, recursive descent, and array slicing to query JSON data. Step-by-step guide with examples.
keywords: query json online, json query tool, extract json values, json path query, json dot notation
date: 2026-03-10
---

# How to Query Nested JSON Objects Online

JSON has become the lingua franca of modern web development, but working with deeply nested JSON structures can be tedious and error-prone. Whether you're debugging an API response, extracting specific values from a large dataset, or transforming raw JSON data, knowing how to query JSON effectively is a critical skill.

In this guide, you'll learn practical techniques for querying nested JSON objects using modern query syntax—without needing to write JavaScript code or use command-line tools. We'll cover all the essential query patterns, show real-world examples, and help you choose the right approach for your use case.

## Why JSON Querying Matters

When you're working with APIs, configuration files, or data exports, you often receive deeply nested JSON structures. Rather than manually parsing through layers of objects and arrays to find the value you need, a good JSON query tool lets you:

- **Extract specific values** without writing code
- **Understand data structure** by navigating hierarchies visually
- **Transform raw data** for analysis or reporting
- **Debug API responses** quickly and efficiently
- **Validate data structure** before processing

The ability to query JSON directly in your browser eliminates the friction of context-switching to a terminal or spinning up a development environment.

## Fundamentals: Dot Notation

The simplest way to access nested JSON values is **dot notation**. Think of it as a path through your data structure.

```json
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "profile": {
      "age": 28,
      "city": "San Francisco"
    }
  }
}
```

To get Alice's city, you'd use:

```
user.profile.city
```

**Result:** `"San Francisco"`

Dot notation is intuitive and handles the most common case: accessing properties of objects at any depth. However, it only works when you know the exact property names.

## Querying Arrays with Bracket Notation and Indexing

When your JSON contains arrays, bracket notation lets you access specific elements or all elements in an array.

```json
{
  "products": [
    {"id": 1, "name": "Laptop", "price": 1200},
    {"id": 2, "name": "Mouse", "price": 25},
    {"id": 3, "name": "Monitor", "price": 350}
  ]
}
```

To access the first product's name:

```
products[0].name
```

**Result:** `"Laptop"`

To access the second product's price:

```
products[1].price
```

**Result:** `25`

Array indexing works exactly as you'd expect—zero-based, with `[0]` being the first element.

## Wildcards: Extract All Values from an Array

When you want to extract a specific property from **every element** in an array, use the wildcard operator `[*]`:

```
products[*].name
```

**Result:**
```json
["Laptop", "Mouse", "Monitor"]
```

This is incredibly useful for flattening nested structures. Instead of manually iterating through each element, you get all matching values in a single query.

Want just the prices?

```
products[*].price
```

**Result:**
```json
[1200, 25, 350]
```

You can even chain wildcards through nested structures:

```json
{
  "orders": [
    {
      "id": 101,
      "items": [
        {"sku": "ABC", "qty": 2},
        {"sku": "XYZ", "qty": 1}
      ]
    },
    {
      "id": 102,
      "items": [
        {"sku": "DEF", "qty": 3}
      ]
    }
  ]
}
```

```
orders[*].items[*].sku
```

**Result:**
```json
[["ABC", "XYZ"], ["DEF"]]
```

## Array Slicing: Get a Range of Elements

Array slicing lets you extract a contiguous subset of elements without knowing how many there are. The syntax is `[start:end]`, where `end` is exclusive (just like Python):

```
products[0:2]
```

**Result:**
```json
[
  {"id": 1, "name": "Laptop", "price": 1200},
  {"id": 2, "name": "Mouse", "price": 25}
]
```

Get the last two elements:

```
products[1:3]
```

**Result:**
```json
[
  {"id": 2, "name": "Mouse", "price": 25},
  {"id": 3, "name": "Monitor", "price": 350}
]
```

Omit the start index to slice from the beginning:

```
products[:2]
```

Omit the end index to slice to the end:

```
products[1:]
```

Slicing is particularly useful when you're working with paginated datasets or need to preview the first few items without loading everything.

## Bracket Notation: Query Keys with Special Characters

When a JSON key contains spaces, hyphens, or other special characters, dot notation won't work. Use bracket notation with quotes instead:

```json
{
  "api-response": {
    "status-code": 200,
    "data": {}
  }
}
```

```
["api-response"]["status-code"]
```

**Result:** `200`

This is essential for working with configuration files and API responses that use kebab-case or other unconventional naming.

## Recursive Descent: Find Values at Any Depth

The most powerful query feature is **recursive descent**, which searches for a property at any depth in your JSON structure without knowing the exact path.

Use the `..` operator:

```json
{
  "company": {
    "department": {
      "team": {
        "email": "team@company.com"
      }
    },
    "email": "contact@company.com"
  }
}
```

```
..email
```

**Result:**
```json
["team@company.com", "contact@company.com"]
```

Recursive descent finds all occurrences of the property, at any nesting level. This is invaluable when exploring unfamiliar data structures—you don't need to know the exact hierarchy to find what you're looking for.

Combine it with wildcards for even more power:

```json
{
  "regions": [
    {
      "countries": [
        {"name": "France", "capital": "Paris"},
        {"name": "Spain", "capital": "Madrid"}
      ]
    },
    {
      "countries": [
        {"name": "Japan", "capital": "Tokyo"}
      ]
    }
  ]
}
```

```
..capital
```

**Result:**
```json
["Paris", "Madrid", "Tokyo"]
```

## Real-World Example: Querying an API Response

Let's combine these techniques with a realistic example:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "alice",
        "email": "alice@example.com",
        "posts": [
          {"id": 101, "title": "First Post", "likes": 15},
          {"id": 102, "title": "Second Post", "likes": 42}
        ]
      },
      {
        "id": 2,
        "username": "bob",
        "email": "bob@example.com",
        "posts": [
          {"id": 103, "title": "Hello World", "likes": 8}
        ]
      }
    ]
  }
}
```

Extract all usernames:

```
data.users[*].username
```

**Result:** `["alice", "bob"]`

Extract all post titles from all users:

```
data.users[*].posts[*].title
```

**Result:** `[["First Post", "Second Post"], ["Hello World"]]`

Get the first user's email:

```
data.users[0].email
```

**Result:** `"alice@example.com"`

Get like counts for the first two posts across all users:

```
data.users[*].posts[0:2][*].likes
```

**Result:** `[[15, 42], [8]]`

## Combining Syntax Patterns

The real power emerges when you combine these patterns:

- **Dot notation + wildcards**: `users[*].email` → extract a single property from all array elements
- **Dot notation + bracket notation**: `config["api-key"].production` → navigate objects with special character keys
- **Wildcards + array slicing**: `users[*].posts[0:3]` → get the first three posts from each user
- **Recursive descent + wildcards**: `..phone[*]` → find all phone arrays anywhere in the structure
- **Bracket notation + recursive descent**: `..["private-key"]` → find all properties named `private-key` anywhere

## Best Practices for JSON Querying

1. **Start simple**: Begin with dot notation for straightforward lookups
2. **Use wildcards** to extract properties from all array elements
3. **Leverage recursive descent** when exploring unfamiliar data
4. **Combine slicing and wildcards** for efficient extraction of subsets
5. **Test incrementally**: Build queries step-by-step to understand data structure
6. **Document complex queries**: If you have a multi-step query, add a comment explaining what you're extracting

## Try It Yourself

The best way to learn JSON querying is hands-on experimentation. **Try it in [json.express](/query/)** — paste your own JSON data and start querying. The browser-based interface gives you immediate feedback and helps you understand how each query pattern works with your specific data.

## Summary of Query Syntax

| Pattern | Example | Use Case |
|---------|---------|----------|
| Dot notation | `user.profile.age` | Access nested object properties |
| Bracket notation | `config["api-key"]` | Access keys with special characters |
| Array index | `items[0]` | Access specific array element |
| Wildcard | `items[*].name` | Extract property from all array elements |
| Array slicing | `items[0:3]` | Get a range of array elements |
| Recursive descent | `..email` | Find property at any depth |
| Combined | `data.users[*].posts[0:2].title` | Complex nested extraction |

Mastering these patterns will make JSON querying intuitive and efficient, whether you're debugging API responses, analyzing data exports, or transforming configuration files.
