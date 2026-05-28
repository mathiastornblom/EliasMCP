# Citrix Unicon Management ELIAS

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes the Unicon ELIAS 18 REST API as tools for AI assistants and Claude Desktop.

ELIAS (eLux Image and Application Server) is Unicon's OS image management platform for thin clients. Manage containers, image definitions, templates, packages, certificates, and access controls — all through natural language.

---

## Install via Docker MCP Toolkit (recommended)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) with the MCP Toolkit enabled, find **Citrix Unicon Management ELIAS** in the catalog at [hub.docker.com/mcp](https://hub.docker.com/mcp) and click **Add**. Configure your ELIAS server URL, username, and password in the UI — no CLI needed.

---

## Manual installation

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — or Node.js 20+ for source installs

### Option A — Docker (recommended)

```bash
# Pull and run
docker pull mcp/elias-mcp-server
echo "" | docker run --rm -i \
  -e ELIAS_BASE_URL=https://elias.example.com:22130/api \
  -e ELIAS_USERNAME=admin \
  -e ELIAS_PASSWORD=secret \
  mcp/elias-mcp-server
```

Add to your MCP client config (Claude Desktop, Claude Code, etc.):

```json
{
  "mcpServers": {
    "elias": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--env-file", "/path/to/.env",
        "mcp/elias-mcp-server"
      ]
    }
  }
}
```

### Option B — From source

```bash
git clone https://github.com/mathiastornblom/EliasMCP.git
cd EliasMCP
npm install
npm run build
```

Add to your MCP client config:

```json
{
  "mcpServers": {
    "elias": {
      "command": "node",
      "args": ["/path/to/EliasMCP/dist/index.js"],
      "env": {
        "ELIAS_BASE_URL": "https://elias.example.com:22130/api",
        "ELIAS_USERNAME": "admin",
        "ELIAS_PASSWORD": "secret"
      }
    }
  }
}
```

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ELIAS_BASE_URL` | yes | `https://elias.example.com:22130/api` — must include `/api` |
| `ELIAS_USERNAME` | yes | ELIAS login username |
| `ELIAS_PASSWORD` | yes | ELIAS login password |
| `ELIAS_DOMAIN` | no | Login domain (leave empty if not required) |
| `ELIAS_IGNORE_TLS` | no | `true` to accept self-signed certificates |
| `ELIAS_REQUEST_TIMEOUT_MS` | no | HTTP timeout in ms (default: 30000) |
| `ELIAS_TEST_CONTAINER` | tests only | Container name used for destructive integration tests |

> **Note:** You can also configure credentials at runtime using the `elias_configure` tool — no `.env` file needed.

> **Warning:** `ELIAS_IGNORE_TLS=true` disables certificate verification. Use only with self-signed certificates in controlled environments.

---

## Runtime configuration

After connecting to your MCP client, use `elias_configure` to set credentials without restarting:

```
elias_configure(action="set", baseUrl="https://elias.example.com:22130/api", username="admin", password="secret")
```

To persist credentials across sessions:

```
elias_configure(action="set", baseUrl="...", username="...", password="...", save=true)
```

---

## Available Tools (11)

| Tool | Description |
|------|-------------|
| `elias_configure` | Set, inspect, or clear ELIAS credentials at runtime |
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

---

## Authentication

ELIAS uses Bearer token authentication. The client logs in via `POST /api/authenticate` and sends the token as an `x-access-token` header on every subsequent request. On a 401 response the client re-authenticates once and retries automatically.

---

## Running tests

Tests require a live ELIAS server. Destructive operations run inside `ELIAS_TEST_CONTAINER`.

```bash
cp .env.example .env   # fill in your values
npm test
```

The test suite creates the test container if it does not exist and cleans it up on teardown.

---

## ELIAS concepts

| Term | Description |
|------|-------------|
| Container | A named collection of packages and image definitions |
| IDF | Image Definition File — defines an OS image |
| IDT | Image Definition Template — template for IDFs |
| EPM | eLux Package Manager package (OS components) |
| FPM | Feature Package Manager package (add-on features) |

---

## Architecture

```
src/
  index.ts        MCP server entry point (stdio transport)
  client.ts       EliasClient — x-access-token auth, undici TLS control
  session.ts      Runtime credential store and ~/.elias-mcp.json persistence
  types.ts        Shared helpers: ok(), fail(), buildQuery()
  tools/          One file per functional group (11 tools total)
catalog/
  server.yaml     Docker MCP Registry submission metadata
  tools.json      Static tool list for registry build validation
.github/
  workflows/
    update-mcp-registry.yml   Auto-updates registry PR on every push to main
    cleanup-runs.yml          Deletes failed workflow runs automatically
```
