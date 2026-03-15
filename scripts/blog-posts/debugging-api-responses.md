---
title: Debugging API Responses — A Developer's JSON Workflow
description: Learn practical techniques for inspecting, querying, and validating JSON API responses during development. Speed up debugging with browser tools and json.express.
keywords: debug api response, json api debugging, inspect json response, api troubleshooting, json response validation, rest api debugging
date: 2026-03-10
---

# Debugging API Responses — A Developer's JSON Workflow

You hit Send in Postman, `curl` a staging endpoint, or check DevTools — and you're staring at a wall of JSON. The response is 400 lines deep, nested three levels, and something is wrong. Maybe a field is missing, maybe a value is `null` when it shouldn't be, or maybe the shape just doesn't match what the frontend expects.

Here's a workflow for making sense of API responses quickly, without scrolling through raw text.

## Step 1: Format First, Read Second

Raw API responses are often minified. Before you do anything, format the JSON so you can actually read it:

```json
{"users":[{"id":1,"name":"Alice","roles":["admin","editor"],"profile":{"avatar":null,"bio":"Engineer at Acme Corp","settings":{"theme":"dark","notifications":{"email":true,"push":false}}}},{"id":2,"name":"Bob","roles":["viewer"],"profile":{"avatar":"https://example.com/bob.jpg","bio":"Designer","settings":{"theme":"light","notifications":{"email":false,"push":true}}}}]}
```

Paste that into [json.express](/) and you instantly see the structure. But formatting alone isn't enough when you're debugging — you need to drill into specific parts.

## Step 2: Query the Parts You Care About

Instead of scanning the entire response, use a query to extract exactly what you're looking for. For instance, if you're debugging why avatars aren't rendering:

```
users[*].profile.avatar
```

This returns:

```json
[null, "https://example.com/bob.jpg"]
```

Now you can see immediately: Alice's avatar is `null`. That's your bug — or at least, that's where the frontend needs a fallback.

## Step 3: Check the Shape With TypeScript Types

When the API response doesn't match what your code expects, generating TypeScript types from the actual response is invaluable. Paste the response into json.express, switch to the **TypeScript** tab, and you get:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "profile": {
        "avatar": null,
        "settings": {
          "theme": "dark"
        }
      }
    }
  ]
}
```

Compare the generated types against your frontend interfaces. Mismatches — like `avatar: string` in your code vs `avatar: string | null` in reality — become obvious.

## Step 4: Compare Before and After

Changing an API endpoint? Use the [Compare](/compare/) tool to diff the old response against the new one. This catches regressions like:

- Fields that were renamed (`userName` → `name`)
- Fields that disappeared entirely
- Type changes (a number becoming a string)
- New `null` values where there were none before

Paste the old response on the left, the new one on the right, and the diff highlights every change.

## Step 5: Share the Evidence

Once you've found the issue, you need to share it — in a bug report, a Slack message, or a PR comment. json.express encodes both your input and query into the URL hash, so you can share a link that reproduces exactly what you see. No screenshots of terminal output needed.

## Real-World Example: Pagination Bug

Say your frontend shows 10 items but the API claims `total_count: 50`. Query the response:

```
meta.pagination
```

```json
{
  "page": 1,
  "per_page": 10,
  "total_count": 50,
  "next_cursor": null
}
```

`next_cursor` is `null` on page 1 — that's the bug. The API isn't returning a cursor for the next page, so your frontend thinks there's nothing more to load.

## Real-World Example: Auth Token Inspection

JWT payloads are just base64-encoded JSON. Decode the payload segment and paste it in:

```json
{
  "sub": "user_12345",
  "email": "alice@example.com",
  "roles": ["admin", "editor"],
  "iat": 1710000000,
  "exp": 1710003600,
  "iss": "auth.example.com",
  "permissions": {
    "projects": ["read", "write", "delete"],
    "billing": ["read"]
  }
}
```

Query `permissions.projects` to quickly check if the token has the right scopes, or check `exp` to see if the token has expired.

## Tips for Faster Debugging

**Copy from DevTools directly.** In Chrome DevTools, right-click a network response → Copy → Copy Response. Paste into json.express — no need to re-run the request.

**Use recursive descent for deep searches.** If you're looking for a field but don't know where it is in the tree, use `..fieldName`. For example, `..email` finds every `email` field at any depth.

**Check arrays with slicing.** If an API returns hundreds of items, use `items[0:3]` to inspect just the first few without the noise.

**Use the Tree view.** For deeply nested responses, the Tree view lets you expand and collapse sections interactively — much faster than scrolling through formatted JSON.

Debugging JSON API responses doesn't have to mean squinting at raw text in a terminal. A good workflow — format, query, compare, share — turns a 20-minute debugging session into a 2-minute one.
