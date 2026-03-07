# Complete Flow Analysis: MCP Servers and Client Services

## Architecture Overview

This is a **Model Context Protocol (MCP)** based AI platform with two main components:

1. **Gateway** - The client that connects to MCP servers and orchestrates AI agents
2. **MCP Server** - The server that provides tools (product management)

---

## MCP Servers Available

### 1. Product Server (Currently Enabled)

**Location:** `mcp-server/` | **Config:** `gateway/mcp-servers.config.json`

| Tool Name                 | Description                        | Parameters                                               |
| ------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `get_all_products`        | Get all products from the database | None                                                     |
| `get_product_by_id`       | Get a single product by ID         | `id` (required)                                          |
| `add_product`             | Add a new product                  | `name`, `price`, `stock`, `description`                  |
| `update_product`          | Update existing product            | `id` (required), `name`, `price`, `stock`, `description` |
| `delete_product`          | Delete a product                   | `id` (required)                                          |
| `get_products_by_filters` | Filter products                    | `name`, `minPrice`, `maxPrice`, `inStock`                |

### 2. Filesystem Server (Disabled)

**Config:** `gateway/mcp-servers.config.json`

- Command: `npx -y @modelcontextprotocol/server-filesystem /allowed/path`

### 3. Custom Server (Disabled)

**Config:** `gateway/mcp-servers.config.json`

- Placeholder for custom business logic with environment variables support

---

## Gateway Client Services

### 1. MCP Client Service

**File:** `gateway/src/mcp-client/mcp-client.service.ts`

| Method                                         | Description                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| `listTools()`                                  | Get all available tools from ALL connected servers |
| `listToolsFromServer(serverName)`              | Get tools from a specific server                   |
| `callTool(name, args)`                         | Auto-find and call tool across all servers         |
| `callToolOnServer(serverName, toolName, args)` | Call tool on specific server                       |
| `getConnectedServers()`                        | Get list of connected server names                 |
| `getServerInfo()`                              | Get detailed server info                           |
| `enableServer(serverName)`                     | Enable and connect a server                        |
| `disableServer(serverName)`                    | Disable and disconnect a server                    |
| `reloadServers()`                              | Reload configuration                               |

### 2. Agent Service

**File:** `gateway/src/agent/agent.service.ts`

| Method                     | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `ask(sessionId, question)` | Main entry point for AI queries with tool execution |
| `getAvailableServers()`    | Get available MCP servers                           |
| `getAvailableTools()`      | Get all available tools grouped by server           |

**Reasoning Loop Config:**

- Max iterations: 5
- Max tool calls: 10

### 3. LLM Service

**File:** `gateway/src/llm/openrouter.service.ts`

- Provider: **OpenRouter** (compatible with OpenAI SDK)
- Model: `qwen/qwen-2.5-72b-instruct`
- Base URL: `https://openrouter.ai/api/v1`

### 4. Session Service

**File:** `gateway/src/session/session.service.ts`

- Manages conversation history per session
- Methods: `createSession()`, `getMessages()`, `addMessage()`, `setMessages()`, `clearSession()`

### 5. Observability/Trace Service

**File:** `gateway/src/observablity/trace.service.ts`

- Logs tool execution traces with session ID, tool name, input, output, status, duration

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Gateway)                              │
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐ │
│  │ AI Controller│    │AgentController│    │   Observability Module   │ │
│  │/ai/test      │    │/agent/ask     │    │   - TraceService         │ │
│  └──────┬───────┘    └───────┬───────┘    └──────────────────────────┘ │
│         │                    │                                          │
│         ▼                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      AgentService                               │    │
│  │  1. Create session                                              │    │
│  │  2. Get tools from MCP Client                                   │    │
│  │  3. Build system message                                        │    │
│  │  4. Run reasoning loop (max 5 iterations)                      │    │
│  │     - Call LLM with tools                                       │    │
│  │     - Execute tool calls via MCP Client                        │    │
│  │     - Log traces                                                │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   McpClientService                              │    │
│  │  • Manages connections to MCP servers                          │    │
│  • Loads config from mcp-servers.config.json                       │    │
│  • Creates StdioClientTransport for each server                   │    │
│  • Methods: listTools(), callTool(), callToolOnServer()            │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│         ┌────────────────────┼────────────────────┐                     │
│         ▼                    ▼                    ▼                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │ product-     │    │filesystem-   │    │ custom-      │             │
│  │ server       │    │server        │    │ server       │             │
│  │ (ENABLED)    │    │(DISABLED)    │    │ (DISABLED)   │             │
│  └──────┬───────┘    └──────────────┘    └──────────────┘             │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   MCP Server (mcp-server)                      │    │
│  │                                                                │    │
│  │  ┌──────────────────┐    ┌─────────────────────────────┐      │    │
│  │  │   McpService     │───▶│   ProductService            │      │    │
│  │  │  - get_all_      │    │  - findAll(), findOne()     │      │    │
│  │  │    products      │    │  - create(), update()       │      │    │
│  │  │  - get_product   │    │  - delete(), getProducts    │      │    │
│  │  │    _by_id        │    │    ByFilters()              │      │    │
│  │  │  - add_product   │    └─────────────────────────────┘      │    │
│  │  │  - update_       │                                       │    │
│  │  │    product       │    ┌─────────────────────────────┐      │    │
│  │  │  - delete_       │    │   Product Entity            │      │    │
│  │  │    product       │    │  - id, name, price, stock  │      │    │
│  │  │  - get_products  │    └─────────────────────────────┘      │    │
│  │  │    _by_filters   │                                       │    │
│  │  └──────────────────┘                                        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      LLM (OpenRouter)                             │   │
│  │  Model: qwen/qwen-2.5-72b-instruct                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

| Endpoint     | Method | Description                                               |
| ------------ | ------ | --------------------------------------------------------- |
| `/agent/ask` | POST   | Main AI agent endpoint (requires `sessionId`, `question`) |
| `/ai/test`   | GET    | Simple LLM test endpoint (requires `q` query param)       |

---

## Configuration Files

| File                              | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `gateway/mcp-servers.config.json` | MCP server configuration (enabled/disabled servers) |
| `gateway/.env.sample`             | Environment variables template                      |
| `mcp-server/.env.sample`          | MCP server env template                             |

---

## Product Entity Schema

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| id    | number | Primary key, auto-generated |
| name  | string | Product name                |
| price | number | Product price               |
| stock | number | Available stock quantity    |

---

## MCP Server Tools Implementation Details

### get_all_products

- Returns all products from the database
- Returns "No products found" if empty

### get_product_by_id

- Parameter: `id` (number, required)
- Returns product or "Product with ID X not found"

### add_product

- Parameters: `name` (string), `price` (number), `stock` (number), `description` (string, optional)
- Returns created product with ID

### update_product

- Parameter: `id` (number, required), plus optional `name`, `price`, `stock`, `description`
- Returns updated product or "Product with ID X not found"

### delete_product

- Parameter: `id` (number, required)
- Returns "Product with ID X deleted successfully" or error

### get_products_by_filters

- Parameters (all optional): `name`, `minPrice`, `maxPrice`, `inStock`
- Supports partial name matching and price range filtering
