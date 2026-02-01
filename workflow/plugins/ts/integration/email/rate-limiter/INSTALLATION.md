# Rate Limiter Plugin - Installation Guide

## Quick Start

### 1. Installation

The rate limiter is already integrated as a workspace in the email plugins:

```bash
# Install all dependencies
cd /workflow/plugins/ts/integration/email/
npm install
```

### 2. Build Plugin

```bash
npm run build
```

### 3. Run Tests

```bash
npm run test
```

## Integration into Your Project

### Option A: Use from Email Plugin

```typescript
import { rateLimiterExecutor } from '@metabuilder/workflow-plugins-email';

const result = await rateLimiterExecutor.execute(node, context, state);
```

### Option B: Direct Plugin Import

```typescript
import { rateLimiterExecutor } from './workflow/plugins/ts/integration/email/rate-limiter/src/index';

const result = await rateLimiterExecutor.execute(node, context, state);
```

## Configuration

### Development (Default)

Uses in-memory storage:
- No external dependencies
- Single-instance only
- Perfect for development and testing

### Production (Redis)

Configure Redis connection:

```typescript
const config: RateLimitConfig = {
  operationType: 'send',
  accountId: 'acc-123',
  tenantId: 'tenant-acme',
  redisUrl: 'redis://redis.internal:6379'
};
```

## Environment Setup

### Docker Compose (Development)

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

Start Redis:
```bash
docker-compose up -d redis
```

### Environment Variables

```bash
REDIS_URL=redis://localhost:6379
RATE_LIMIT_SYNC_QUOTA=100
RATE_LIMIT_SEND_QUOTA=50
RATE_LIMIT_SEARCH_QUOTA=500
```

## Workflow Integration

### Register Plugin in Workflow Engine

```typescript
import { rateLimiterExecutor } from '@metabuilder/workflow-plugins-email';

// Register executor
workflowEngine.registerExecutor(rateLimiterExecutor);
```

### Use in Workflow

```json
{
  "nodes": [
    {
      "id": "check-rate-limit",
      "nodeType": "rate-limiter",
      "parameters": {
        "operationType": "send",
        "accountId": "{{ $json.accountId }}",
        "tenantId": "{{ $json.tenantId }}"
      }
    }
  ]
}
```

## API Integration

### Express.js Example

```typescript
import express from 'express';
import { rateLimiterExecutor } from '@metabuilder/workflow-plugins-email';

const app = express();

app.post('/api/send-email', async (req, res) => {
  const result = await rateLimiterExecutor.execute({
    nodeType: 'rate-limiter',
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

### Fastify Example

```typescript
import Fastify from 'fastify';
import { rateLimiterExecutor } from '@metabuilder/workflow-plugins-email';

const fastify = Fastify();

fastify.post('/api/send-email', async (request, reply) => {
  const result = await rateLimiterExecutor.execute({
    nodeType: 'rate-limiter',
    parameters: {
      operationType: 'send',
      accountId: request.user.accountId,
      tenantId: request.user.tenantId
    }
  }, context, state);

  if (!result.output.data.allowed) {
    reply.status(429);
    Object.entries(result.output.data.headers).forEach(([key, value]) => {
      reply.header(key, value);
    });
    return { error: 'Rate limit exceeded' };
  }

  // Send email...
  return { success: true };
});
```

## Verification

### 1. Test Plugin

```bash
cd workflow/plugins/ts/integration/email/rate-limiter
npm run test
```

### 2. Verify Exports

```bash
cd workflow/plugins/ts/integration/email
npm ls @metabuilder/workflow-plugin-rate-limiter
```

### 3. Type Check

```bash
npx tsc --noEmit
```

### 4. Run in Development

```typescript
import { rateLimiterExecutor } from '@metabuilder/workflow-plugins-email';

// Test basic execution
const result = await rateLimiterExecutor.execute({
  nodeType: 'rate-limiter',
  parameters: {
    operationType: 'send',
    accountId: 'test-account',
    tenantId: 'test-tenant'
  }
}, {}, {});

console.log('Status:', result.status);
console.log('Allowed:', result.output.data.allowed);
console.log('Remaining:', result.output.data.remainingTokens);
```

## Troubleshooting

### Issue: Module not found

```
Error: Cannot find module '@metabuilder/workflow-plugins-email'
```

Solution:
```bash
npm install
npm run build
```

### Issue: Types not available

```
Error: Cannot find type definition
```

Solution:
```bash
npm run type-check
tsc --declaration
```

### Issue: Redis connection failed

```
Error: Redis connection timeout
```

Solution:
1. Check Redis is running
2. Verify REDIS_URL environment variable
3. Plugin falls back to in-memory storage
4. Check Docker Compose setup

### Issue: Rate limit not enforcing

```
Requests not being blocked despite quota exceeded
```

Solution:
1. Verify operationType is correct (sync/send/search)
2. Check accountId and tenantId are correct
3. Review bucket statistics: `getBucketStats()`
4. Check reset window has not reset bucket

## Next Steps

1. **Read Documentation**
   - README.md - User guide
   - RATE_LIMITER_IMPLEMENTATION.md - Deep dive
   - RATE_LIMITER_QUICK_REFERENCE.md - Quick start

2. **Run Tests**
   - npm run test - Full suite
   - npm run test:coverage - Coverage report

3. **Integrate with Workflow**
   - Register executor with workflow engine
   - Create rate-limiter nodes in workflows
   - Test with sample requests

4. **Deploy to Production**
   - Configure Redis backend
   - Set environment variables
   - Monitor quota usage
   - Gather metrics

5. **Monitor and Optimize**
   - Use getBucketStats() for monitoring
   - Adjust quotas based on usage
   - Plan Phase 7 enhancements

## Support

For issues or questions:
1. Check RATE_LIMITER_QUICK_REFERENCE.md
2. Review test cases for examples
3. Check error messages in logs
4. Contact MetaBuilder team

## Version

- Plugin Version: 1.0.0
- Requires: @metabuilder/workflow ^3.0.0
- TypeScript: ^5.9.0
- Node.js: ^18.0.0
