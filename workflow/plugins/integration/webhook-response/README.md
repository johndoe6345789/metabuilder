# Webhook Response Node Plugin

Return HTTP responses to webhook senders.

## Installation

```bash
npm install @metabuilder/workflow-plugin-webhook-response
```

## Usage

```json
{
  "id": "webhook-success",
  "type": "operation",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 200,
    "body": {
      "success": true,
      "message": "Webhook processed successfully",
      "id": "{{ $json.id }}"
    },
    "headers": {
      "X-Custom-Header": "value"
    }
  }
}
```

## Operations

### Success Response (2xx)
Return success response to webhook sender:

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "data": "{{ $json }}"
  }
}
```

### Created Response (201)
Indicate resource was created:

```json
{
  "statusCode": 201,
  "body": {
    "success": true,
    "id": "{{ $json.id }}",
    "message": "Resource created"
  }
}
```

### Error Response (4xx)
Return error response:

```json
{
  "statusCode": 400,
  "body": {
    "success": false,
    "error": "Invalid input",
    "details": "{{ $json.error }}"
  }
}
```

### Server Error Response (5xx)
Return server error:

```json
{
  "statusCode": 500,
  "body": {
    "success": false,
    "error": "Internal server error"
  }
}
```

## Parameters

- `statusCode` (optional): HTTP status code (100-599)
  - Default: 200
  - Common: 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 500
- `body` (optional): Response body
  - Can be object (will be JSON encoded)
  - Can be string (will be sent as-is)
  - Supports template expressions
  - Default: Auto-generated based on status code
- `headers` (optional): Custom response headers
  - Object with string key-value pairs
  - Supports template expressions
  - Cannot override restricted headers

## Status Codes

### Success Codes (2xx)
- `200` - OK (default)
- `201` - Created
- `202` - Accepted
- `204` - No Content

### Client Error Codes (4xx)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests

### Server Error Codes (5xx)
- `500` - Internal Server Error
- `501` - Not Implemented
- `502` - Bad Gateway
- `503` - Service Unavailable

## Response Headers

Default headers automatically included:
- `Content-Type` - Determined by body type (auto-detected or specified)
- `X-Webhook-Delivered` - ISO timestamp of response

## Content Type Detection

The plugin automatically detects content type:
- JSON objects → `application/json`
- Strings starting with `{` or `[` → `application/json`
- Strings starting with `<` → `application/xml`
- CSV-like strings → `text/csv`
- Other strings → `text/plain`

Override with custom header:
```json
{
  "headers": {
    "Content-Type": "application/json; charset=utf-8"
  }
}
```

## Template Expressions

Response body and headers support template interpolation:

```json
{
  "body": {
    "id": "{{ $json.id }}",
    "status": "{{ $context.tenantId !== undefined ? 'multi-tenant' : 'single-tenant' }}",
    "timestamp": "{{ $json.createdAt }}"
  },
  "headers": {
    "X-Request-ID": "{{ $json.requestId }}",
    "X-Tenant": "{{ $context.tenantId }}"
  }
}
```

## Features

- HTTP status code customization (100-599)
- Template expression support in body and headers
- Automatic content type detection
- Restricted header protection
- Default responses based on status code
- Multi-format response support (JSON, XML, CSV, plain text)
- Custom header support
- Terminal node (ends workflow execution)

## Examples

### Simple Success Response

```json
{
  "id": "webhook-response-ok",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 200
  }
}
```

Returns:
```json
{
  "success": true,
  "status": 200,
  "message": "OK"
}
```

### Echo Back Data with Custom Headers

```json
{
  "id": "webhook-echo",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 200,
    "body": "{{ $json }}",
    "headers": {
      "X-Echo": "true",
      "X-Processed": "{{ $context.executionId }}"
    }
  }
}
```

### Validation Error Response

```json
{
  "id": "webhook-validation-error",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 422,
    "body": {
      "success": false,
      "error": "Validation failed",
      "errors": {
        "email": "Invalid email format",
        "name": "Name is required"
      }
    }
  }
}
```

### Async Accepted Response

```json
{
  "id": "webhook-accepted",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 202,
    "body": {
      "success": true,
      "message": "Request accepted for processing",
      "jobId": "{{ $json.requestId }}",
      "statusUrl": "{{ $env.BASE_URL }}/status/{{ $json.requestId }}"
    }
  }
}
```

### No Content Response

```json
{
  "id": "webhook-no-content",
  "nodeType": "webhook-response",
  "parameters": {
    "statusCode": 204
  }
}
```

Returns HTTP 204 with empty body.

## Restricted Headers

The following headers cannot be customized (automatically managed):
- `Content-Length`
- `Transfer-Encoding`
- `Connection`
- `Keep-Alive`
- `Proxy-Authenticate`
- `WWW-Authenticate`

Attempting to set these will trigger a validation warning.

## License

MIT
