---
title: Working with JSON in CI/CD Pipelines
description: Practical techniques for parsing, validating, and transforming JSON in GitHub Actions, Docker configs, and deployment scripts. Avoid common pitfalls with JSON in automation.
keywords: json cicd, json github actions, json pipeline, parse json ci, docker json config, json automation, json deployment
date: 2026-02-14
---

# Working with JSON in CI/CD Pipelines

JSON shows up constantly in CI/CD: GitHub Actions outputs, Docker inspect results, Terraform plans, deployment manifests, test reports. You often need to extract a value, validate a structure, or transform data between pipeline steps — and you're doing it in bash, which makes JSON handling awkward.

Here are the common patterns and how to handle them without losing your mind.

## GitHub Actions: Passing JSON Between Steps

GitHub Actions uses JSON everywhere — step outputs, matrix strategies, artifact metadata. A common pattern is building a JSON object in one step and consuming it in another:

```json
{
  "include": [
    { "os": "ubuntu-latest", "node": "18", "experimental": false },
    { "os": "ubuntu-latest", "node": "20", "experimental": false },
    { "os": "ubuntu-latest", "node": "22", "experimental": true },
    { "os": "macos-latest", "node": "20", "experimental": false }
  ]
}
```

This is a typical matrix strategy definition. When debugging why a specific matrix combination isn't running, paste the generated JSON into json.express and query `include[*].os` to see all OS values, or `include[?experimental==true]` to find experimental builds.

## Docker: Inspecting Container Config

`docker inspect` outputs verbose JSON. A running container's inspect output can be 300+ lines. Here's a trimmed example:

```json
{
  "Id": "a1b2c3d4e5f6",
  "State": {
    "Status": "running",
    "Running": true,
    "Pid": 12345,
    "ExitCode": 0,
    "StartedAt": "2026-03-10T08:30:00Z"
  },
  "NetworkSettings": {
    "Ports": {
      "3000/tcp": [
        { "HostIp": "0.0.0.0", "HostPort": "3000" }
      ],
      "9229/tcp": null
    },
    "Networks": {
      "bridge": {
        "IPAddress": "172.17.0.3",
        "Gateway": "172.17.0.1"
      }
    }
  },
  "Config": {
    "Env": [
      "NODE_ENV=production",
      "DATABASE_URL=postgres://db:5432/app",
      "REDIS_URL=redis://cache:6379"
    ],
    "Cmd": ["node", "dist/server.js"],
    "Image": "my-app:latest"
  },
  "Mounts": [
    {
      "Type": "volume",
      "Name": "app-data",
      "Source": "/var/lib/docker/volumes/app-data/_data",
      "Destination": "/app/data"
    }
  ]
}
```

Instead of piping through `jq` in a script, paste the full inspect output and query the section you need:

- `State.Status` — is it running?
- `NetworkSettings.Ports` — what ports are mapped?
- `Config.Env` — what environment variables are set?
- `Mounts[0].Destination` — where are volumes mounted?

## Terraform: Reading Plan Output

`terraform show -json` produces a JSON representation of your infrastructure plan. These files can be enormous — thousands of lines for a moderately complex stack. The structure looks like:

```json
{
  "format_version": "1.0",
  "terraform_version": "1.7.0",
  "planned_values": {
    "root_module": {
      "resources": [
        {
          "address": "aws_instance.web",
          "type": "aws_instance",
          "name": "web",
          "values": {
            "ami": "ami-0c55b159cbfafe1f0",
            "instance_type": "t3.medium",
            "tags": {
              "Name": "web-server",
              "Environment": "production"
            }
          }
        },
        {
          "address": "aws_rds_instance.db",
          "type": "aws_rds_instance",
          "name": "db",
          "values": {
            "engine": "postgres",
            "engine_version": "15.4",
            "instance_class": "db.t3.medium",
            "allocated_storage": 100
          }
        }
      ]
    }
  },
  "resource_changes": [
    {
      "address": "aws_instance.web",
      "change": {
        "actions": ["update"],
        "before": { "instance_type": "t3.small" },
        "after": { "instance_type": "t3.medium" }
      }
    }
  ]
}
```

Useful queries:

- `resource_changes[*].address` — what resources are changing?
- `resource_changes[*].change.actions` — what kind of changes (create, update, delete)?
- `planned_values..resources[*].type` — all resource types in the plan

This is much faster than scrolling through a 2,000-line plan trying to find what's being modified.

## Test Reports: Parsing Results

Many test runners output JSON reports. A typical Jest JSON report:

```json
{
  "numTotalTests": 142,
  "numPassedTests": 138,
  "numFailedTests": 4,
  "numPendingTests": 0,
  "testResults": [
    {
      "testFilePath": "src/auth/login.test.ts",
      "status": "failed",
      "testResults": [
        {
          "title": "should reject expired tokens",
          "status": "failed",
          "failureMessages": ["Expected 401 but received 200"]
        },
        {
          "title": "should accept valid tokens",
          "status": "passed"
        }
      ]
    },
    {
      "testFilePath": "src/api/users.test.ts",
      "status": "passed",
      "testResults": [
        {
          "title": "should list users",
          "status": "passed"
        }
      ]
    }
  ]
}
```

When a CI build fails, you want to quickly find what broke. Query `..testResults[*].status` to see all test statuses, or look at the summary with `numFailedTests`.

## Common Mistakes in CI/CD JSON Handling

**String escaping in bash.** This is the number one source of broken pipelines. JSON inside bash variables needs careful quoting:

```json
{
  "message": "Build failed: \"timeout\" in step 3",
  "status": "error"
}
```

That inner quote in the message value will break naive bash string interpolation. If you're constructing JSON in bash, use `jq` instead of `echo` — or better yet, generate the JSON in a proper language and pass it through.

**Assuming consistent key ordering.** JSON object keys have no guaranteed order. Your pipeline should never depend on keys appearing in a specific position — always query by key name, not by position.

**Not validating before consuming.** If a previous pipeline step produces JSON that your next step depends on, validate it first. A malformed JSON payload will cause confusing downstream failures. Paste the intermediate output into json.express to verify it parses correctly and has the expected shape.

## Quick Debugging Workflow

When a CI pipeline fails and you're staring at JSON output in the logs:

1. Copy the JSON from the CI log
2. Paste into [json.express](/) — the lenient parser handles any trailing commas or formatting quirks
3. Query the specific field that matters (`status`, `error`, `exitCode`, etc.)
4. Use the URL sharing feature to paste the link directly into the PR or issue

This saves the back-and-forth of asking colleagues to "look at line 847 of the CI output" — they click the link and see exactly the data you're pointing to.
