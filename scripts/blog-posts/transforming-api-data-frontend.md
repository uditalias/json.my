---
title: Transforming API Data for Your Frontend — JSON Patterns That Scale
description: Learn practical patterns for reshaping JSON API responses for frontend consumption. Covers normalization, flattening, filtering, and type safety with real examples.
keywords: transform json api, json data transformation, reshape json, normalize json, json frontend patterns, api response mapping, json data mapping
date: 2026-02-07
---

# Transforming API Data for Your Frontend — JSON Patterns That Scale

APIs rarely return data in the exact shape your UI needs. The backend sends nested objects, the frontend wants flat lists. The API returns snake_case, your TypeScript uses camelCase. The response includes 40 fields per item, but the component only renders 5.

This gap between "what the API gives you" and "what the UI needs" is where data transformation lives. Here are the patterns that come up most often, with practical examples you can explore interactively.

## Pattern 1: Flattening Nested Responses

APIs love nesting. Here's a typical user endpoint response:

```json
{
  "data": {
    "users": [
      {
        "id": 1,
        "attributes": {
          "name": "Alice Chen",
          "email": "alice@example.com",
          "department": {
            "id": 10,
            "name": "Engineering",
            "location": { "floor": 3, "building": "HQ" }
          }
        },
        "relationships": {
          "manager": { "data": { "id": 5, "type": "user" } },
          "team": { "data": [{ "id": 2 }, { "id": 3 }, { "id": 4 }] }
        }
      },
      {
        "id": 2,
        "attributes": {
          "name": "Bob Park",
          "email": "bob@example.com",
          "department": {
            "id": 10,
            "name": "Engineering",
            "location": { "floor": 3, "building": "HQ" }
          }
        },
        "relationships": {
          "manager": { "data": { "id": 1, "type": "user" } },
          "team": { "data": [{ "id": 1 }, { "id": 3 }] }
        }
      }
    ]
  }
}
```

Your user list component doesn't need three levels of nesting. To understand what the frontend actually needs, start by querying the relevant fields:

- `data.users[*].attributes.name` — all user names
- `data.users[*].attributes.department.name` — all department names
- `data.users[0].relationships` — relationship shape for the first user

This helps you design the flat interface your component will use — something like `{ id, name, email, departmentName, managerId }`.

## Pattern 2: Normalizing for State Management

If you're using Redux, Zustand, or similar state management, you typically want normalized data — objects keyed by ID rather than arrays:

```json
{
  "products": [
    { "id": "p1", "name": "Widget", "categoryId": "c1", "price": 29.99 },
    { "id": "p2", "name": "Gadget", "categoryId": "c1", "price": 49.99 },
    { "id": "p3", "name": "Doohickey", "categoryId": "c2", "price": 19.99 }
  ],
  "categories": [
    { "id": "c1", "name": "Electronics", "productCount": 2 },
    { "id": "c2", "name": "Accessories", "productCount": 1 }
  ]
}
```

The target normalized shape looks like:

```json
{
  "products": {
    "byId": {
      "p1": { "id": "p1", "name": "Widget", "categoryId": "c1", "price": 29.99 },
      "p2": { "id": "p2", "name": "Gadget", "categoryId": "c1", "price": 49.99 },
      "p3": { "id": "p3", "name": "Doohickey", "categoryId": "c2", "price": 19.99 }
    },
    "allIds": ["p1", "p2", "p3"]
  },
  "categories": {
    "byId": {
      "c1": { "id": "c1", "name": "Electronics", "productCount": 2 },
      "c2": { "id": "c2", "name": "Accessories", "productCount": 1 }
    },
    "allIds": ["c1", "c2"]
  }
}
```

Use json.express to explore both shapes side by side. Query `products.byId.p1` to verify a specific item, or `products.allIds` to check the ordering. The Compare tool is useful here — paste the original API response and the normalized version to verify nothing was lost.

## Pattern 3: Extracting Fields for List Views

A product API might return 30 fields per item, but your list view only shows 4:

```json
{
  "items": [
    {
      "id": "ord_001",
      "status": "shipped",
      "created_at": "2026-03-01T10:00:00Z",
      "updated_at": "2026-03-05T14:30:00Z",
      "customer": {
        "id": "cust_42",
        "name": "Alice Chen",
        "email": "alice@example.com",
        "tier": "premium"
      },
      "line_items": [
        { "sku": "WDG-001", "name": "Widget", "qty": 2, "unit_price": 29.99 },
        { "sku": "GDG-001", "name": "Gadget", "qty": 1, "unit_price": 49.99 }
      ],
      "totals": {
        "subtotal": 109.97,
        "tax": 9.90,
        "shipping": 5.99,
        "total": 125.86
      },
      "shipping_address": {
        "street": "123 Main St",
        "city": "Portland",
        "state": "OR",
        "zip": "97201"
      }
    }
  ]
}
```

For an order list, you probably only need: order ID, status, customer name, and total. Query these individually to verify the paths:

- `items[*].id` — order IDs
- `items[*].status` — statuses
- `items[*].customer.name` — customer names
- `items[*].totals.total` — totals

This query-first approach helps you write your transformation function with confidence — you know exactly what path to use before writing any code.

## Pattern 4: Handling Pagination Metadata

Paginated APIs wrap results in metadata:

```json
{
  "data": [
    { "id": 1, "title": "First post" },
    { "id": 2, "title": "Second post" }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 15,
    "total_count": 147,
    "per_page": 10
  },
  "links": {
    "self": "/api/posts?page=1",
    "next": "/api/posts?page=2",
    "last": "/api/posts?page=15"
  }
}
```

Your frontend needs to separate the actual data from the pagination state. Query `data` for the items and `meta` for the pagination controls. When building infinite scroll or pagination components, the `links` object tells you where to fetch next.

## Pattern 5: Type Safety With Generated Interfaces

After you've figured out the transformation, generate TypeScript types from both the API response and the transformed output. Paste the raw API response into json.express's TypeScript tab to get the "input" types, then paste your desired flattened shape to get the "output" types.

This gives you two interfaces:

- `ApiUserResponse` — the raw shape from the server
- `User` — the clean shape your components expect

Your transformation function signature becomes clear: `(response: ApiUserResponse) => User[]`. If the API ever changes its response shape, the TypeScript compiler catches it at build time.

## The Workflow

When you encounter a new API endpoint your frontend needs to consume:

1. **Fetch the raw response** and paste it into json.express
2. **Explore with queries** to understand the data structure and find the fields you need
3. **Switch to Tree view** for deeply nested responses to understand the hierarchy
4. **Generate TypeScript types** from the raw response
5. **Design your target shape** — the flat, clean interface your components want
6. **Write the transformation** using the exact paths you discovered through querying
7. **Compare the input and output** to verify nothing important was dropped

This is faster than reading API documentation (which is often incomplete or outdated) and more reliable than guessing at the response structure based on the endpoint name.
