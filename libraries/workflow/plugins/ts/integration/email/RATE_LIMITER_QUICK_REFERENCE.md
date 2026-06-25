# Rate Limiter - Quick Reference

## One-Minute Overview

The rate limiter prevents abuse by enforcing quotas:
- **Sync**: 100 requests/hour
- **Send**: 50 requests/hour
- **Search**: 500 requests/hour

## Basic Usage

```typescript
// Check if request is allowed
const result = await executor.execute(
  {
    nodeType: 'rate-limiter',
    parameters: {
      operationType: 'send',
      accountId: 'acc-123',
      tenantId: 'tenant-acme'
    }
  },
  context,
  state
);

// Handle response
if (result.status === 'success') {
  const rateLimit = result.output.data;

  if (rateLimit.allowed) {
    // Proceed with operation
    console.log(`Quota: ${rateLimit.remainingTokens}/${rateLimit.bucketCapacity}`);
  } else {
    // Return 429 Too Many Requests
    return {
      status: 429,
      headers: rateLimit.headers,
      body: { error: rateLimit.error }
    };
  }
} else {
  // Handle error
  return {
    status: 500,
    body: { error: result.error }
  };
}
```

## Common Scenarios

### Scenario 1: Simple Rate Limit Check

```json
{
  "operationType": "send",
  "accountId": "acc-123",
  "tenantId": "tenant-acme"
}
```

### Scenario 2: Batch with Multiple Tokens

```json
{
  "operationType": "send",
  "accountId": "acc-123",
  "tenantId": "tenant-acme",
  "tokensToConsume": 5
}
```

### Scenario 3: Custom Quota

```json
{
  "operationType": "sync",
  "accountId": "acc-456",
  "tenantId": "tenant-acme",
  "customLimit": 500
}
```

## Response Headers

Always included:
- `X-RateLimit-Limit`: Total quota (e.g., "50")
- `X-RateLimit-Remaining`: Tokens left (e.g., "49")
- `X-RateLimit-Reset`: Timestamp when resets (ms)
- `X-RateLimit-Reset-In`: Seconds until reset

When blocked:
- `Retry-After`: Seconds to wait before retry

## HTTP Integration

```typescript
// Express.js example
app.post('/send', async (req, res) => {
  const result = await rateLimiter.execute({
    parameters: {
      operationType: 'send',
      accountId: req.user.accountId,
      tenantId: req.user.tenantId
    }
  }, context, state);

  if (!result.output.data.allowed) {
    return res
      .status(429)
      .set(result.output.data.headers)
      .json({ error: 'Rate limit exceeded' });
  }

  // Send email...
  return res.json({ success: true });
});
```

## Admin Commands

### Reset Quota

```typescript
await executor.resetQuota('acc-123', 'tenant-acme', 'send');
```

### Get Statistics

```typescript
const stats = await executor.getBucketStats('acc-123', 'tenant-acme');

// Returns:
{
  sync: { remaining: 90, capacity: 100, quotaPercentage: 90 },
  send: { remaining: 40, capacity: 50, quotaPercentage: 80 },
  search: { remaining: 450, capacity: 500, quotaPercentage: 90 }
}
```

## Status Codes

| Status | Meaning |
|--------|---------|
| `success` + `allowed: true` | Request allowed, quota consumed |
| `success` + `allowed: false` | Quota exceeded, blocked |
| `error` | Invalid configuration or error |

## Error Messages

```
Rate limit exceeded for send. Quota: 50 per 1 hour(s). Retry after 1800 seconds.
```

Breaking down:
- Operation: `send`
- Limit: `50` per hour
- Wait time: `1800` seconds (30 minutes)

## Testing

```bash
npm run test              # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Performance

- **Speed**: <1ms (memory), 5-10ms (Redis)
- **Storage**: ~100 bytes per bucket
- **Latency**: No query to database

## Quotas by Operation

| Operation | Limit | Window | Use Case |
|-----------|-------|--------|----------|
| sync | 100/hr | 1 hour | IMAP sync |
| send | 50/hr | 1 hour | Sending emails |
| search | 500/hr | 1 hour | Full-text search |

Override any quota with `customLimit` parameter.

## Debugging

### Check if Allowed

```typescript
const rateLimit = result.output.data;
console.log(`Allowed: ${rateLimit.allowed}`);
console.log(`Remaining: ${rateLimit.remainingTokens}/${rateLimit.bucketCapacity}`);
console.log(`Reset in: ${rateLimit.resetIn}s`);
```

### Monitor Usage

```typescript
const stats = await executor.getBucketStats(accountId, tenantId);

for (const [op, stat] of Object.entries(stats)) {
  console.log(`${op}: ${stat.remaining}/${stat.capacity} (${stat.quotaPercentage}%)`);
}
```

### Troubleshoot Blocking

```typescript
const rateLimit = result.output.data;

if (!rateLimit.allowed) {
  console.log(`Blocked: ${rateLimit.error}`);
  console.log(`Retry after: ${rateLimit.retryAfter}s`);
  console.log(`Reset at: ${new Date(rateLimit.resetAt)}`);
}
```

## Multi-Tenant Example

```typescript
// Tenant A, Account 123
const result1 = await executor.execute({
  parameters: {
    operationType: 'send',
    accountId: 'acc-123',
    tenantId: 'tenant-a'
  }
}, context, state);

// Tenant B, Account 123 (different quota)
const result2 = await executor.execute({
  parameters: {
    operationType: 'send',
    accountId: 'acc-123',
    tenantId: 'tenant-b'
  }
}, context, state);

// Both have full quota (separate buckets)
console.log(result1.output.data.remainingTokens); // 49/50
console.log(result2.output.data.remainingTokens); // 49/50
```

## Workflow Node Example

```json
{
  "id": "rate-check",
  "nodeType": "rate-limiter",
  "parameters": {
    "operationType": "{{ $json.operation }}",
    "accountId": "{{ $json.accountId }}",
    "tenantId": "{{ $json.tenantId }}"
  },
  "on": {
    "success": ["check-allowed"],
    "error": ["handle-error"]
  }
}
```

## Validation Checklist

✓ operationType is 'sync', 'send', or 'search'
✓ accountId is a non-empty string
✓ tenantId is a non-empty string
✓ tokensToConsume >= 1 (if specified)
✓ customLimit >= 1 (if specified)
✓ resetWindowMs >= 60000 (if specified)

## Common Patterns

### Pattern: Check Before Batch Operation

```typescript
// Check if batch is allowed
const result = await executor.execute({
  parameters: {
    operationType: 'send',
    accountId: accountId,
    tenantId: tenantId,
    tokensToConsume: emailList.length
  }
}, context, state);

if (!result.output.data.allowed) {
  // Send only partial batch
  const maxEmails = result.output.data.remainingTokens;
  return await sendBatch(emailList.slice(0, maxEmails));
}

// Send all emails
return await sendBatch(emailList);
```

### Pattern: Per-IP Rate Limiting

```typescript
// Use IP address as part of account ID
const result = await executor.execute({
  parameters: {
    operationType: 'search',
    accountId: `${userId}:${ipAddress}`,
    tenantId: tenantId
  }
}, context, state);
```

### Pattern: Quota Sharing

```typescript
// Check combined quota for multiple accounts
for (const accountId of accountList) {
  const stats = await executor.getBucketStats(accountId, tenantId);
  totalRemaining += stats.send.remaining;
}

if (totalRemaining < requiredTokens) {
  return { error: 'Insufficient quota across accounts' };
}
```

## FAQ

**Q: What happens when quota resets?**
A: Bucket refills to full capacity automatically. No admin action needed.

**Q: Can quotas be increased?**
A: Yes, use `customLimit` parameter to override default quota.

**Q: Does Redis need to be configured?**
A: No, falls back to in-memory storage if Redis unavailable.

**Q: Can tokens be "bought" or "earned"?**
A: Not in Phase 6. Possible in future versions via `resetQuota` API.

**Q: How long does rate limit check take?**
A: <1ms with memory backend, 5-10ms with Redis.

## Next Steps

1. Review [README.md](./README.md) for detailed documentation
2. Read [RATE_LIMITER_IMPLEMENTATION.md](./RATE_LIMITER_IMPLEMENTATION.md) for architecture
3. Check [src/index.test.ts](./src/index.test.ts) for usage examples
4. Run tests: `npm run test`
