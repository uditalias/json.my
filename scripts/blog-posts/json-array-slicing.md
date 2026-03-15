---
title: JSON Array Slicing — Extract Subsets of Data Easily
description: Learn how to use array slicing syntax to extract portions of JSON arrays. Covers start:end ranges, negative indices, and practical examples.
keywords: json array slice, json array subset, json array filter, json array range, extract json array elements
date: 2026-02-25
---

# JSON Array Slicing — Extract Subsets of Data Easily

Array slicing is one of the most underrated features for working with JSON data. Instead of manually filtering or looping, you can extract exactly the subset you need with a single, readable syntax. It's borrowed from Python and available in tools like json.express.

If you've ever thought "I just need the first 5 items" or "skip the first 2, then take 3," slicing is your answer.

## What Is Array Slicing?

Array slicing is a way to extract a contiguous subset (or "slice") of an array. The syntax is `[start:end]`, where:

- `start` = index to begin (inclusive)
- `end` = index to stop (exclusive)

It's called slicing because you're taking a slice of the array without modifying the original.

### Basic Syntax

```
[0:3]      // Elements at indices 0, 1, 2 (not 3)
[2:5]      // Elements at indices 2, 3, 4
[0:1]      // First element only
[5:]       // From index 5 to the end
[:3]       // From start to index 3 (exclusive)
```

## Practical Examples

Let's use a sample array:

```json
[
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry",
  "fig",
  "grape"
]
```

With indices:
```
Index:  0       1       2        3      4           5    6
Value: apple  banana  cherry   date  elderberry   fig  grape
```

### Common Slicing Operations

| Slice | Result | Use Case |
|-------|--------|----------|
| `[0:3]` | `["apple", "banana", "cherry"]` | First 3 items |
| `[2:5]` | `["cherry", "date", "elderberry"]` | Items 2–4 |
| `[0:1]` | `["apple"]` | First item as array |
| `[5:7]` | `["fig", "grape"]` | Items 5–6 |
| `[4:]` | `["elderberry", "fig", "grape"]` | From index 4 onward |
| `[:2]` | `["apple", "banana"]` | First 2 items |

Notice: the end index is **exclusive**. `[0:3]` gets indices 0, 1, 2—not 3.

## Negative Indices

Negative numbers count from the end:

- `-1` = last element
- `-2` = second-to-last
- `-3` = third-to-last, etc.

With our array:

| Slice | Result | Explanation |
|-------|--------|-------------|
| `[-2:]` | `["fig", "grape"]` | Last 2 items |
| `[-3:]` | `["elderberry", "fig", "grape"]` | Last 3 items |
| `[:-1]` | `["apple", ..., "fig"]` | Everything except last |
| `[:-2]` | `["apple", ..., "elderberry"]` | Everything except last 2 |
| `[-4:-1]` | `["date", "elderberry", "fig"]` | Items from index -4 to -1 |

Negative indices are incredibly useful. `[-10:]` means "give me the last 10 items, or all items if there are fewer than 10."

## Nested Array Slicing

In real JSON, you often have arrays of objects. Slicing works at the top level:

```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" },
    { "id": 3, "name": "Charlie" },
    { "id": 4, "name": "Diana" }
  ]
}
```

Query: `users[0:2]`

Result:
```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

Query: `users[-1]`

Result:
```json
{ "id": 4, "name": "Diana" }
```

But here's a key point: slicing gives you an array, while indexing gives you an element:

```
users[0:1]   // [{ "id": 1, "name": "Alice" }]  — array with 1 element
users[0]     // { "id": 1, "name": "Alice" }    — just the object
```

Use `[0:1]` when you need to preserve array structure; use `[0]` when you want the element itself.

## Real-World Use Cases

### 1. Pagination

API returns 100 results, but you want to display 20 per page:

```json
{
  "results": [...]  // 100 items
}
```

Page 1 (items 0–19): `results[0:20]`
Page 2 (items 20–39): `results[20:40]`
Page 3 (items 40–59): `results[40:60]`

Formula: Page N = `results[(N-1)*20 : N*20]`

### 2. Recent Items

A feed API returns posts in chronological order. Get the 5 most recent:

```json
{
  "posts": [
    { "id": 1, "title": "...", "date": "2026-01-01" },
    { "id": 2, "title": "...", "date": "2026-02-01" },
    ...
    { "id": 100, "title": "...", "date": "2026-03-10" }
  ]
}
```

Query: `posts[-5:]`

Result: The last 5 posts (most recent)

### 3. Data Sampling

You have 10,000 records and want a sample of every 100th:

Manual approach: complex filter logic
Slicing approach: Can't do directly, but slicing helps with sampling workflows (take `[0:100]`, process, then `[100:200]`, etc.)

### 4. Skip and Take

Common in APIs: "skip the first 10, then give me 5"

With slicing: `items[10:15]`

In SQL terms: `OFFSET 10 LIMIT 5`

### 5. Time-Series Data

Extract data from a specific time window:

```json
{
  "measurements": [
    { "timestamp": "2026-03-01T00:00:00Z", "value": 100 },
    { "timestamp": "2026-03-02T00:00:00Z", "value": 110 },
    ...
    { "timestamp": "2026-03-31T00:00:00Z", "value": 150 }
  ]
}
```

Get data for days 10–20: `measurements[9:20]` (adjusting for 0-based indexing and your range)

## Slicing in JavaScript

JavaScript has a built-in `Array.slice()` method:

```javascript
const arr = ["apple", "banana", "cherry", "date"];

arr.slice(0, 2)   // ["apple", "banana"]
arr.slice(1, 3)   // ["banana", "cherry"]
arr.slice(-2)     // ["cherry", "date"]
arr.slice(2)      // ["cherry", "date"]
```

Syntax is slightly different: `array.slice(start, end)` instead of `[start:end]`. But the concept is identical.

Important: `slice()` doesn't modify the original array—it returns a new array. Perfect for working with data without side effects.

```javascript
const original = [1, 2, 3, 4, 5];
const sliced = original.slice(1, 3);

console.log(original);  // [1, 2, 3, 4, 5] (unchanged)
console.log(sliced);    // [2, 3]
```

## How json.express Implements Slicing

json.express supports slicing directly in the query bar. You can combine slicing with dot notation and other path operations:

```
users[0:5]                    // First 5 users
users[0:5].name               // Names of first 5 users
posts[*].comments[0:3]        // First 3 comments of every post
data.results[-10:].id         // IDs of last 10 results
```

The query engine evaluates left to right, so `users[0:5].name` means:
1. Slice users to get indices 0–4
2. For each, get the `name` property

Result: An array of names from the first 5 users.

## Slicing vs. Filtering

**Slicing** is for position-based extraction: "I want indices 0–4" or "I want the last 10."

**Filtering** is for condition-based extraction: "I want all items where price > 100" or "I want posts from this author."

They're complementary:

```javascript
// Slicing: first 10 items
arr.slice(0, 10)

// Filtering: expensive items
arr.filter(item => item.price > 100)

// Both: 10 most recent expensive items
arr
  .filter(item => item.price > 100)
  .slice(-10)
```

json.express slicing handles the positional part; for filtering by condition, you'd need to combine with other tools or do it in your application code.

## Edge Cases

### Empty Slices

```javascript
arr.slice(5, 5)    // [] (empty array)
arr.slice(100, 110) // [] (out of bounds, returns empty)
```

Safe to use—won't throw errors, just returns an empty array.

### Out-of-Bounds Indices

```javascript
arr.slice(2, 100)  // Returns what exists from index 2 onward
arr.slice(-100, 2) // Starts from beginning if -100 is before the array
```

JavaScript handles gracefully. Indices beyond array length are clamped to valid ranges.

### Backwards Slices

```javascript
arr.slice(5, 2)    // [] (start > end returns empty)
```

You can't slice backwards. To reverse, you'd need to reverse the array first or use a different approach.

## Performance Considerations

Slicing is **O(n)** in time complexity—it must copy the sliced portion. But it's optimized at the JavaScript engine level and extremely fast even for large arrays.

For most use cases:
- Slicing 100 items from 1 million: negligible overhead
- Slicing 10,000 items from 1 million: still very fast

Avoid repeated slicing in tight loops (e.g., `arr.slice(0, 10)` thousands of times), but normal use is no problem.

## Tips for Working with Slices

**1. Think in 0-based indexing**
Arrays are 0-based. The first item is index 0, not 1. Adjust your mental math accordingly.

**2. Remember the end is exclusive**
`[0:10]` gives you 10 items (indices 0–9), not 11.

**3. Use negative indices for relative positions**
`[-5:]` is clearer than calculating the exact index from the end.

**4. Combine with other operations**
Slicing integrates with dot notation, wildcards, and recursive descent in tools like json.express.

**5. Validate your range**
If you're computing start/end dynamically, ensure start <= end and both are within bounds.

## Summary

Array slicing is a powerful, readable way to extract subsets of data:

- **Syntax**: `[start:end]` where end is exclusive
- **Negative indices**: Use `-1`, `-2`, etc., for positions from the end
- **Use cases**: Pagination, recent items, sampling, skip-and-take patterns
- **Performance**: Fast even for large arrays
- **Safety**: Out-of-bounds indices are handled gracefully

Whether you're paginating through results, extracting recent items from a feed, or sampling data for analysis, slicing is often the clearest, most efficient approach.

Ready to try it? Head to [json.express](/query/) and explore your JSON with slicing queries. Start simple with `[0:5]`, then experiment with negative indices and nested paths.
