# Email Rate Limiter Plugin - Phase 6

Distributed rate limiting for email operations using the token bucket algorithm with Redis backend support.

## Overview

The rate limiter enforces API quotas for email operations to prevent abuse and ensure fair usage:

- **Sync operations**: 100 requests per hour
- **Send operations**: 50 requests per hour
- **Search operations**: 500 requests per hour

Rate limits are tracked **per account per operation type** with automatic hourly resets and support for multi-tenant environments.

## Features

### Core Capabilities

- **Token Bucket Algorithm**: Smooth rate limiting with token refill mechanism
- **Distributed Backend**: Redis support for multi-instance deployments (with in-memory fallback)
- **Per-Account Tracking**: Separate quotas for each email account
- **Per-Operation Quotas**: Isolated limits for sync/send/search operations
- **Multi-Tenant Support**: Tenant-scoped rate limit isolation
- **HTTP Headers**: Standard rate limit headers in responses
- **Graceful Degradation**: Continues operating if Redis unavailable

### Request Flow

```
1. Check token bucket state (from Redis or memory)
2. Refill tokens based on elapsed time since last refill
3. Check if bucket expired (hourly reset)
4. Attempt to consume tokens
5. Return remaining quota and reset time
6. If quota exceeded: Return retry-after header
```

## Configuration

### Required Parameters

```typescript
{
  operationType: 'sync' | 'send' | 'search',  // Operation type
  accountId: string,                           // UUID of email account
  tenantId: string                             // UUID of tenant
}
```

### Optional Parameters

```typescript
{
  tokensToConsume?: number,      // Tokens to consume per request (default: 1)
  customLimit?: number,          // Override default quota per hour
  resetWindowMs?: number,        // Reset window in ms (default: 3600000)
  redisUrl?: string             // Redis connection URL
}
```

## Usage Examples

### Basic Sync Rate Limit Check

```typescript
const node = {
  nodeType: 'rate-limiter',
  parameters: {
    operationType: 'sync',
    accountId: 'acc-123e4567-e89b-12d3-a456-426614174000',
    tenantId: 'tenant-acme'
  }
};

const result = await rateLimiterExecutor.execute(node, context, state);

if (result.status === 'success') {
  const rateLimit = result.output.data;

  if (rateLimit.allowed) {
    // Proceed with sync operation
    console.log(`Remaining quota: ${rateLimit.remainingTokens}/${rateLimit.bucketCapacity}`);
  } else {
    // Return HTTP 429 with retry-after header
    return {
      status: 429,
      headers: rateLimit.headers,
      body: { error: rateLimit.error }
    };
  }
}
```

### Send Operation with Custom Token Cost

```typescript
{
  operationType: 'send',
  accountId: 'acc-456',
  tenantId: 'tenant-acme',
  tokensToConsume: 5  // Large batch send = 5 tokens
}
```

### Custom Quota Override

```typescript
{
  operationType: 'search',
  accountId: 'acc-789',
  tenantId: 'tenant-acme',
  customLimit: 1000  // Override 500 default with 1000/hour
}
```

### Custom Reset Window

```typescript
{
  operationType: 'sync',
  accountId: 'acc-abc',
  tenantId: 'tenant-acme',
  resetWindowMs: 86400000  // 24-hour reset window instead of 1 hour
}
```

## Response Format

### Success Response (Allowed)

```json
{
  "allowed": true,
  "tokensConsumed": 1,
  "remainingTokens": 99,
  "bucketCapacity": 100,
  "refillRate": 100,
  "resetAt": 1706179200000,
  "resetIn": 3599,
  "headers": {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": "99",
    "X-RateLimit-Reset": "1706179200000",
    "X-RateLimit-Reset-In": "3599"
  }
}
```

### Blocked Response (Quota Exceeded)

```json
{
  "allowed": false,
  "tokensConsumed": 0,
  "remainingTokens": 0,
  "bucketCapacity": 50,
  "refillRate": 50,
  "resetAt": 1706179200000,
  "resetIn": 1800,
  "retryAfter": 1800,
  "error": "Rate limit exceeded for send. Quota: 50 per 1 hour(s). Retry after 1800 seconds.",
  "headers": {
    "X-RateLimit-Limit": "50",
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": "1706179200000",
    "X-RateLimit-Reset-In": "1800",
    "Retry-After": "1800"
  }
}
```

## HTTP Response Headers

All rate limit responses include standard headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Total quota capacity |
| `X-RateLimit-Remaining` | Tokens remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when quota resets |
| `X-RateLimit-Reset-In` | Seconds until quota reset |
| `Retry-After` | Seconds to wait before retry (only if quota exceeded) |

## Token Bucket Algorithm

The token bucket mechanism works as follows:

1. **Initialization**: Bucket starts with full capacity (100 for sync, 50 for send, 500 for search)
2. **Refill**: Tokens are added continuously based on refill rate
   - Rate = Capacity / Reset Window
   - Example: 100 tokens / 3600 seconds = 0.0278 tokens/second
3. **Consumption**: Each request consumes 1+ tokens
4. **Blocking**: If insufficient tokens, request is blocked with retry-after
5. **Reset**: Bucket resets hourly (or custom interval)

### Token Refill Example

For sync operation (100/hour):
- Refill rate: 100 tokens per 3600 seconds = 0.0278 tokens/second
- After 10 seconds: +0.278 tokens refilled
- After 60 seconds: +1.67 tokens refilled
- After 600 seconds: +16.7 tokens refilled
- After 3600 seconds: +100 tokens refilled (full reset)

## Multi-Tenant Isolation

Rate limits are scoped by tenant to prevent one tenant from affecting others:

```
Key format: ratelimit:{tenantId}:{accountId}:{operationType}

Example:
ratelimit:tenant-acme:acc-123:sync
ratelimit:tenant-beta:acc-123:sync  // Different quota, same account ID
```

## Admin Operations

### Reset Account Quota

Force reset of all quotas for an account:

```typescript
await executor.resetQuota('acc-123', 'tenant-acme', 'sync');
```

### Get Bucket Statistics

Retrieve current quota status for all operations:

```typescript
const stats = await executor.getBucketStats('acc-123', 'tenant-acme');

// Returns:
{
  sync: {
    remaining: 75,
    capacity: 100,
    resetAt: 1706179200000,
    quotaPercentage: 75
  },
  send: {
    remaining: 45,
    capacity: 50,
    resetAt: 1706179200000,
    quotaPercentage: 90
  },
  search: {
    remaining: 500,
    capacity: 500,
    resetAt: 1706179200000,
    quotaPercentage: 100
  }
}
```

## Redis Backend (Production)

In production, the plugin supports distributed rate limiting via Redis:

```typescript
const config = {
  operationType: 'sync',
  accountId: 'acc-123',
  tenantId: 'tenant-acme',
  redisUrl: 'redis://redis.internal:6379'
};
```

### Redis Operations

The plugin uses Redis commands:

```bash
# Get bucket state (TTL = reset window)
GET ratelimit:tenant:account:operation

# Set bucket state with expiration
SETEX ratelimit:tenant:account:operation {resetWindowMs} {state}

# Atomic token consumption (Lua script in production)
EVALSHA script_sha {resetWindowMs} {tokens}
```

### Fallback Behavior

If Redis is unavailable:
- In-memory storage is used instead
- Rate limits still enforced per instance
- Does not provide cross-instance coordination
- Automatic recovery when Redis available

## Testing

Comprehensive test suite covers:

### Validation
- Required vs optional parameters
- Parameter type checking
- Valid operation types
- Quota and window constraints

### Success Cases
- Requests within quota allowed
- Multiple operation type isolation
- Per-account isolation
- Per-tenant isolation
- HTTP headers populated correctly

### Quota Exceeded
- Blocking when quota exhausted
- Retry-after header provided
- Partial quota consumption

### Custom Configuration
- Custom quota limits
- Custom reset windows
- Custom token consumption

### Token Refill
- Tokens refill over time
- Bucket reset on window expiration

### Admin Operations
- Quota reset functionality
- Bucket statistics retrieval

### Performance
- Concurrent request handling
- Execution duration tracking

### Error Handling
- Invalid parameter detection
- Redis unavailable fallback

Run tests:

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Quota Defaults

| Operation | Limit | Window |
|-----------|-------|--------|
| sync | 100 | 1 hour |
| send | 50 | 1 hour |
| search | 500 | 1 hour |

## Integration with Workflow Engine

The rate limiter integrates as a workflow node:

```json
{
  "id": "node-rate-check",
  "type": "rate-limiter",
  "parameters": {
    "operationType": "send",
    "accountId": "{{ $json.accountId }}",
    "tenantId": "{{ $json.tenantId }}"
  },
  "on": {
    "success": ["node-send-email"],
    "blocked": ["node-send-429-error"]
  }
}
```

### Workflow Integration Pattern

```
1. Email Send Request
   ↓
2. Rate Limiter Check
   ├─→ [Allowed] → Execute Send
   └─→ [Blocked] → Return 429 + Retry-After
```

## Performance Characteristics

- **Single Request**: <1ms (in-memory), 5-10ms (Redis)
- **Concurrent Requests**: Linear scaling with instance count
- **Memory**: ~100 bytes per tracked account per operation
- **Redis**: O(1) operations via atomic scripts

## Security Considerations

1. **Tenant Isolation**: Rate limits scoped by tenant ID
2. **Account Isolation**: Separate quotas per account ID
3. **No Information Leakage**: Same rate limit response for all operation types
4. **Distributed Safety**: Redis-backed for multi-instance coordination
5. **Reset Window Randomization**: Optional jitter to prevent thundering herd

## Error Handling

The executor returns proper error codes:

- `RATE_LIMIT_ERROR`: Configuration or execution error
- `blocked`: Quota exceeded (HTTP 429)
- `success`: Request allowed

## Monitoring and Observability

### Metrics to Track

```typescript
// Per account per operation
rate_limit_remaining_tokens
rate_limit_quota_percentage
rate_limit_requests_blocked
rate_limit_reset_window_duration
```

### Log Entries

```
INFO: Rate limit check - operation=sync, account=acc-123, remaining=99/100
WARN: Rate limit quota low - operation=send, account=acc-456, remaining=2/50
ERROR: Rate limit exceeded - operation=search, account=acc-789, retry_after=1800
```

## Future Enhancements

- [ ] Redis Cluster support
- [ ] Token burst allowance
- [ ] Per-IP rate limiting
- [ ] Quota sharing across accounts
- [ ] Adaptive quota adjustment
- [ ] Rate limit analytics dashboard
- [ ] Webhook notifications on quota warnings

## License

Apache 2.0
