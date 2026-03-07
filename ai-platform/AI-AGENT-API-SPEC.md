# AI Agent Platform - API Specification

This document outlines all the APIs required from the gateway/backend side, including their request/response structures.

## Base URL

```
http://localhost:3000
```

---

## Table of Contents

1. [Agent APIs](#agent-apis)
2. [Session APIs](#session-apis)
3. [Message APIs](#message-apis)
4. [Server Status APIs](#server-status-apis)
5. [Error Responses](#error-responses)

---

## Agent APIs

### 1. Ask Agent (Send Message)

Ask the AI agent a question and receive a response with optional tool calls.

**Endpoint:** `POST /agent/ask`

#### Request

```json
{
  "sessionId": "string",
  "question": "string"
}
```

#### Response (Success)

```json
{
  "response": "string",
  "sessionId": "string",
  "toolCalls": [
    {
      "id": "string",
      "name": "get_products",
      "arguments": "{\"category\": \"electronics\"}",
      "result": "string (optional)",
      "status": "pending" | "success" | "error"
    }
  ],
  "metadata": {
    "tokenCount": 150,
    "processingTime": 2500,
    "serverName": "Products API"
  }
}
```

#### Response (Error - No Servers)

```json
{
  "response": "No MCP servers are currently connected. Please check your configuration."
}
```

---

### 2. Regenerate Response

Regenerate a response for a specific user message.

**Endpoint:** `POST /messages/:messageId/regenerate`

#### Request

```
No body required (messageId in URL)
```

#### Response (Success)

```json
{
  "response": "string",
  "sessionId": "string",
  "toolCalls": [],
  "metadata": {
    "tokenCount": 180,
    "processingTime": 2100,
    "serverName": "Products API"
  }
}
```

---

## Session APIs

### 3. Get All Sessions

Retrieve all chat sessions for the current user.

**Endpoint:** `GET /sessions`

#### Response (Success)

```json
[
  {
    "id": "session-123",
    "title": "Show all products",
    "createdAt": "2026-03-07T10:00:00.000Z",
    "updatedAt": "2026-03-07T12:30:00.000Z",
    "messageCount": 5,
    "lastMessage": "Show me all electronics"
  },
  {
    "id": "session-124",
    "title": "Create a report",
    "createdAt": "2026-03-06T15:00:00.000Z",
    "updatedAt": "2026-03-06T16:00:00.000Z",
    "messageCount": 3,
    "lastMessage": "Create a sales report"
  }
]
```

---

### 4. Get Single Session

Retrieve a specific session by ID.

**Endpoint:** `GET /sessions/:id`

#### Response (Success)

```json
{
  "id": "session-123",
  "title": "Show all products",
  "createdAt": "2026-03-07T10:00:00.000Z",
  "updatedAt": "2026-03-07T12:30:00.000Z",
  "messageCount": 5,
  "lastMessage": "Show me all electronics"
}
```

---

### 5. Create Session

Create a new chat session.

**Endpoint:** `POST /sessions`

#### Request

```json
{
  "title": "string (optional)"
}
```

#### Response (Success)

```json
{
  "id": "session-125",
  "title": "New Conversation 03/07/2026",
  "createdAt": "2026-03-07T17:00:00.000Z",
  "updatedAt": "2026-03-07T17:00:00.000Z",
  "messageCount": 0,
  "lastMessage": null
}
```

---

### 6. Update Session

Update session properties.

**Endpoint:** `PATCH /sessions/:id`

#### Request

```json
{
  "title": "string (optional)",
  "messageCount": "number (optional)",
  "lastMessage": "string (optional)"
}
```

#### Response (Success)

```json
{
  "id": "session-123",
  "title": "Updated Title",
  "createdAt": "2026-03-07T10:00:00.000Z",
  "updatedAt": "2026-03-07T17:30:00.000Z",
  "messageCount": 6,
  "lastMessage": "New user message"
}
```

---

### 7. Delete Session

Delete a specific session.

**Endpoint:** `DELETE /sessions/:id`

#### Response (Success)

```json
{
  "success": true
}
```

---

### 8. Delete All Sessions

Delete all chat sessions.

**Endpoint:** `DELETE /sessions`

#### Response (Success)

```json
{
  "success": true
}
```

---

## Message APIs

### 9. Get Session Messages

Retrieve all messages for a specific session.

**Endpoint:** `GET /sessions/:sessionId/messages`

#### Response (Success)

```json
[
  {
    "id": "msg-001",
    "sessionId": "session-123",
    "content": "Show me all electronics products",
    "role": "user",
    "timestamp": "2026-03-07T10:00:00.000Z"
  },
  {
    "id": "msg-002",
    "sessionId": "session-123",
    "content": "Here are the electronics products available...",
    "role": "assistant",
    "timestamp": "2026-03-07T10:00:02.000Z",
    "toolCalls": [
      {
        "id": "tool-001",
        "name": "get_products",
        "arguments": "{\"category\": \"electronics\"}",
        "result": "[{\"id\": 1, \"name\": \"Laptop\"}]",
        "status": "success"
      }
    ],
    "metadata": {
      "tokenCount": 150,
      "processingTime": 2500,
      "serverName": "Products API"
    }
  }
]
```

---

## Server Status APIs

### 10. Get Connected Servers

Get list of connected MCP servers and their status.

**Endpoint:** `GET /servers/status`

#### Response (Success)

```json
{
  "servers": [
    {
      "id": "server-1",
      "name": "Products API",
      "status": "connected",
      "endpoint": "http://localhost:3001",
      "tools": [
        "get_products",
        "create_product",
        "update_product",
        "delete_product"
      ]
    },
    {
      "id": "server-2",
      "name": "Files Server",
      "status": "connected",
      "endpoint": "http://localhost:3002",
      "tools": ["read_file", "write_file", "list_files"]
    },
    {
      "id": "server-3",
      "name": "Data Analysis",
      "status": "disconnected",
      "endpoint": "http://localhost:3003",
      "tools": []
    }
  ],
  "connectedCount": 2
}
```

---

### 11. Server Health Check

Check if a specific server is healthy.

**Endpoint:** `GET /servers/:serverId/health`

#### Response (Success)

```json
{
  "serverId": "server-1",
  "healthy": true,
  "latency": 45,
  "lastChecked": "2026-03-07T17:00:00.000Z"
}
```

#### Response (Unhealthy)

```json
{
  "serverId": "server-3",
  "healthy": false,
  "error": "Connection refused",
  "lastChecked": "2026-03-07T17:00:00.000Z"
}
```

---

## Error Responses

All API errors follow a standard format:

### 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "error": "Bad Request"
}
```

### 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

### 404 - Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 - Internal Server Error

```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred",
  "error": "Internal Server Error"
}
```

### 503 - Service Unavailable

```json
{
  "statusCode": 503,
  "message": "MCP servers not available",
  "error": "Service Unavailable"
}
```

---

## Data Types Reference

### Message Role

```typescript
type MessageRole = "user" | "assistant" | "system";
```

### Tool Call Status

```typescript
type ToolCallStatus = "pending" | "success" | "error";
```

### Server Status

```typescript
type ServerStatus = "connected" | "disconnected" | "error";
```

### Session

```typescript
interface Session {
  id: string;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  messageCount: number;
  lastMessage?: string;
}
```

### Message

```typescript
interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: MessageRole;
  timestamp: string; // ISO 8601
  isLoading?: boolean;
  error?: string;
  toolCalls?: ToolCall[];
  metadata?: MessageMetadata;
}
```

### Tool Call

```typescript
interface ToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
  result?: string;
  status: ToolCallStatus;
}
```

### Message Metadata

```typescript
interface MessageMetadata {
  tokenCount?: number;
  serverName?: string;
  processingTime?: number; // milliseconds
}
```

### Server

```typescript
interface Server {
  id: string;
  name: string;
  status: ServerStatus;
  endpoint: string;
  tools: string[];
}
```

---

## Implementation Checklist

### Required Endpoints

- [ ] `POST /agent/ask`
- [ ] `POST /messages/:messageId/regenerate`
- [ ] `GET /sessions`
- [ ] `GET /sessions/:id`
- [ ] `POST /sessions`
- [ ] `PATCH /sessions/:id`
- [ ] `DELETE /sessions/:id`
- [ ] `DELETE /sessions`
- [ ] `GET /sessions/:sessionId/messages`
- [ ] `GET /servers/status`
- [ ] `GET /servers/:serverId/health`

### Optional Endpoints

- [ ] `GET /health` - Overall system health
- [ ] `GET /tools` - List all available tools across servers
