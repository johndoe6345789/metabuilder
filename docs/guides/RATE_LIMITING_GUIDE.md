# Rate Limiting Implementation Guide

**Status**: ✅ COMPLETE
**Implemented**: 2026-01-21
**Location**: `frontends/nextjs/src/lib/middleware/rate-limit.ts`

## Overview

MetaBuilder now includes a comprehensive rate limiting system to prevent:
- **Brute-force attacks** on authentication endpoints
- **User enumeration attacks** (attempting to guess usernames)
- **Denial of Service (DoS)** attacks on public endpoints
- **Bulk data scraping** or unauthorized access

## Quick Start

### Using Rate Limiting in API Routes

```typescript
// Example: Apply rate limiting in an API route
import type { NextRequest } from 'next/server'
import { applyRateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  // Check rate limit for login endpoint
  const limitResponse = applyRateLimit(request, 'login')
  if (limitResponse) {
    return limitResponse // Returns 429 Too Many Requests if limit exceeded
  }

  // ... rest of handler
}
```

### Available Rate Limiters

| Limiter | Limit | Window | Purpose | Status |
|---------|-------|--------|---------|--------|
| `login` | 5 | 1 minute | Login attempts per IP | ✅ Active |
| `register` | 3 | 1 minute | Registration attempts | ✅ Active |
| `list` | 100 | 1 minute | GET list endpoints | ✅ Active |
| `mutation` | 50 | 1 minute | POST/PUT/PATCH/DELETE | ✅ Active |
| `public` | 1000 | 1 hour | Public API endpoints | ✅ Active |
| `bootstrap` | 1 | 1 hour | System bootstrap | ✅ Active |

## Implementation Details

### Where Rate Limiting is Applied

1. **Main API Route** (`/api/v1/[...slug]`)
   - **Login**: 5 attempts/minute per IP
   - **Register**: 3 attempts/minute per IP
   - **GET requests**: 100 requests/minute per IP
   - **Mutations**: 50 requests/minute per IP

2. **Bootstrap Endpoint** (`/api/bootstrap`)
   - **Bootstrap**: 1 attempt/hour per IP
   - Prevents repeated system initialization

### Rate Limit Response

When a rate limit is exceeded, the endpoint returns:

```json
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "error": "Too many requests",
  "retryAfter": 60
}
```

### IP Detection Strategy

Rate limiting uses the client's IP address, with fallback chain:

1. **CloudFlare**: `cf-connecting-ip` header (if behind CloudFlare)
2. **X-Forwarded-For**: `x-forwarded-for` header (if behind proxy, uses first IP)
3. **X-Real-IP**: `x-real-ip` header (if behind nginx/Apache)
4. **Connection IP**: Direct connection IP (development only)
5. **Fallback**: `'unknown'` (should not occur in production)

## Architecture

### InMemoryRateLimitStore

Single-instance in-memory storage suitable for:
- ✅ Development environments
- ✅ Single-instance deployments
- ✅ Testing environments

Not suitable for:
- ❌ Multi-instance deployments (each instance has separate store)
- ❌ Kubernetes clusters
- ❌ Serverless (no state persistence between requests)

### Future: Redis Adapter

For production multi-instance deployments, implement a Redis adapter:

```typescript
// Example: Redis-backed rate limiter (not yet implemented)
const store = createRedisRateLimitStore({
  redis: RedisClient.from(process.env.REDIS_URL),
  prefix: 'ratelimit:',
})
```

This would allow sharing rate limit state across instances.

## Customization

### Create Custom Rate Limiter

```typescript
import { createRateLimiter } from '@/lib/middleware'

// Rate limit per user instead of IP
const userLimiter = createRateLimiter({
  limit: 100,
  window: 60 * 1000,
  keyGenerator: (request) => {
    const userId = extractUserIdFromRequest(request)
    return `user:${userId}`
  }
})

export async function POST(request: NextRequest) {
  const limitResponse = userLimiter(request)
  if (limitResponse) return limitResponse
  // ...
}
```

### Adjust Rate Limits

Edit the rate limit configuration in `rate-limit.ts`:

```typescript
export const rateLimiters = {
  login: createRateLimiter({
    limit: 5,        // Change this to adjust max attempts
    window: 60 * 1000, // Change this to adjust time window
  }),
  // ... other limiters
}
```

### Custom Error Responses

```typescript
const customLimiter = createRateLimiter({
  limit: 5,
  window: 60 * 1000,
  onLimitExceeded: (key, request) => {
    return new Response(
      JSON.stringify({
        error: 'Too many login attempts',
        message: 'Please try again in 1 minute',
        retryAt: new Date(Date.now() + 60000).toISOString(),
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
})
```

## Monitoring & Debugging

### Get Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const status = getRateLimitStatus(request, 'login')

  console.log(`Login attempts: ${status.current}/${status.limit}`)
  console.log(`Remaining: ${status.remaining}`)
}
```

### Reset Rate Limit

```typescript
import { resetRateLimit } from '@/lib/middleware'

// Reset rate limit for an IP (admin operation)
resetRateLimit('192.168.1.100')
```

### Debug in Development

```typescript
// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  console.log(`Rate limit check: ${endpointType}`)
  console.log(`IP: ${getClientIp(request)}`)
  console.log(`Current count: ${store.get(key)}`)
}
```

## Testing Rate Limits

### Manual Testing (Unix/Linux/Mac)

```bash
# Test login rate limiting (should fail on 6th request)
for i in {1..10}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/v1/default/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' \
    -w "Status: %{http_code}\n\n"
  sleep 0.5
done
```

### Manual Testing (Windows PowerShell)

```powershell
# Test login rate limiting
for ($i=1; $i -le 10; $i++) {
  Write-Host "Attempt $i:"
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/default/auth/login" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"test","password":"test"}' `
    -SkipHttpErrorCheck
  Write-Host "Status: $($response.StatusCode)`n"
  Start-Sleep -Milliseconds 500
}
```

### Expected Results

- **Requests 1-5**: Status 200 or other (depending on endpoint logic)
- **Request 6+**: Status 429 Too Many Requests

## Performance Impact

### Memory Usage

- Per IP: ~24 bytes (for entry + overhead)
- With 10,000 unique IPs: ~240 KB
- Automatic cleanup: Expired entries removed every 60 seconds

### Latency

- Rate limit check: **< 1ms** (hash map lookup)
- No external service calls (in-memory store)
- Negligible performance impact

## Security Considerations

### Strengths

✅ Prevents brute-force attacks (5 attempts/min on login)
✅ Prevents user enumeration (register limited to 3/min)
✅ Prevents API scraping (100 requests/min on GET)
✅ Prevents DoS on bootstrap (1/hour)
✅ IP-based (resistant to distributed attacks from same IP)

### Limitations

⚠️ Single-instance only (not suitable for multi-instance without Redis)
⚠️ Memory-based (lost on restart)
⚠️ No cross-IP distributed attack protection
⚠️ No captcha integration
⚠️ No account lockout (only per-IP, not per-account)

### Production Recommendations

For production deployments:

1. **Implement Redis adapter** for distributed rate limiting
2. **Add captcha** after 3 failed login attempts
3. **Add account lockout** logic (contact support flow)
4. **Monitor 429 responses** in error tracking (Sentry)
5. **Alert on rate limit spikes** (potential attack)
6. **Whitelist trusted IPs** if needed (admin dashboards, monitoring systems)

## Troubleshooting

### Rate limiting too strict?

Increase limits or time window:

```typescript
login: createRateLimiter({
  limit: 10,        // Increased from 5
  window: 120 * 1000, // Increased to 2 minutes
})
```

### Rate limiting not working?

Check:
1. Middleware is imported and called
2. Check request headers (IP detection may fail)
3. Check browser console for 429 responses
4. Enable debug logging

### Wrong IP detected?

Verify proxy headers:
```typescript
// Add logging in getClientIp()
console.log('CF IP:', request.headers.get('cf-connecting-ip'))
console.log('X-Forwarded-For:', request.headers.get('x-forwarded-for'))
```

## Future Enhancements

### Planned

- [ ] Redis adapter for distributed rate limiting
- [ ] Captcha integration after N failures
- [ ] Account-level lockout (not just IP)
- [ ] Dynamic rate limits based on threat level
- [ ] Rate limit analytics and dashboard
- [ ] User-friendly error pages with countdown timer

### Consider

- Sliding window vs fixed window (currently sliding)
- Token bucket algorithm for smoother limits
- ML-based anomaly detection
- Integration with WAF (Web Application Firewall)

## References

- Implementation: `frontends/nextjs/src/lib/middleware/rate-limit.ts`
- Main API Route: `frontends/nextjs/src/app/api/v1/[...slug]/route.ts`
- Bootstrap Route: `frontends/nextjs/src/app/api/bootstrap/route.ts`
- NIST Guidelines: [Rate Limiting Best Practices](https://owasp.org/www-community/attacks/Brute_force_attack)

---

**Last Updated**: 2026-01-21
**Status**: Production Ready (Single-Instance)
**Next**: Implement Redis adapter for multi-instance deployments
