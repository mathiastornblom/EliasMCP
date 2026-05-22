# EliasMCP — MCP Server for Unicon ELIAS 18

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes the Unicon ELIAS 18 REST API as tools for AI agents and Claude Desktop.

ELIAS (eLux Image and Application Server) is Unicon's OS image server for thin clients.

## Prerequisites

- Node.js 20 or later
- An ELIAS 18 server (default port: 22130)

## Installation

```bash
npm install
npm run build
```

## Configuration

### Option 1 — Runtime configuration via `elias_configure` tool

After connecting Claude Desktop to this MCP server, use the `elias_configure` tool:

```
elias_configure(action="set", baseUrl="https://elias.example.com:22130/api", username="admin", password="secret")
```

To persist credentials across sessions:

```
elias_configure(action="set", baseUrl="...", username="...", password="...", save=true)
```

### Option 2 — Environment variables

Create a `.env` file (for development):

```
ELIAS_BASE_URL=https://elias.example.com:22130/api
ELIAS_USERNAME=admin
ELIAS_PASSWORD=secret
ELIAS_DOMAIN=
ELIAS_IGNORE_TLS=false
ELIAS_REQUEST_TIMEOUT_MS=30000
```

> **Note:** `ELIAS_BASE_URL` must include the `/api` path segment.

### Option 3 — Saved credential file

Credentials are stored in `~/.elias-mcp.json` when you pass `save=true` to `elias_configure`.

## Connecting to Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "elias": {
      "command": "node",
      "args": ["/absolute/path/to/EliasMCP/dist/index.js"]
    }
  }
}
```

Or use the included `.mcp.json`:

```bash
claude --mcp-config .mcp.json
```

## Available Tools

| Tool | Description |
|------|-------------|
| `elias_configure` | Configure ELIAS server credentials |
| `elias_containers` | List, check, create, rename, or delete containers |
| `elias_images` | Manage image definitions (IDF) — CRUD, sign, lock |
| `elias_image_templates` | Manage image templates (IDT) — CRUD, sign, lock |
| `elias_packages` | List EPMs/FPMs, delete EPMs, cleanup unused packages |
| `elias_certificates` | Manage certificates and signing certificates |
| `elias_solve` | Solve IDF dependencies, check/find conflicts, self-containment |
| `elias_export` | Export containers, IDFs, IDTs, JIDFs, signatures, STW, zip |
| `elias_import` | Import binary files (zip/cab/udf/cap/bup), IDFs, IDTs, JIDFs |
| `elias_access_control` | List, create, or delete access controls |
| `elias_about` | Get copyright and version information for a container |

## Authentication

ELIAS uses Bearer token authentication via the `x-access-token` header. The server handles login automatically and refreshes the token on 401 responses.

## TLS

For servers with self-signed certificates, set `ignoreTls=true` in `elias_configure` or `ELIAS_IGNORE_TLS=true` in your environment.

## Running Tests

```bash
export ELIAS_BASE_URL=https://elias.example.com:22130/api
export ELIAS_USERNAME=admin
export ELIAS_PASSWORD=secret
export ELIAS_IGNORE_TLS=true          # if self-signed certificate
export ELIAS_TEST_CONTAINER=mcp-test  # container used for destructive tests

npm test
```

The test suite creates the test container if it does not exist and cleans it up on teardown.

## ELIAS Concepts

| Term | Description |
|------|-------------|
| Container | A named collection of packages and image definitions |
| IDF | Image Definition File — defines an OS image |
| IDT | Image Definition Template — template for IDFs |
| EPM | eLux Package Manager package (OS components) |
| FPM | Feature Package Manager package (add-on features) |
