# Bad Gateway Errors - Fixed

## Problem
The application was experiencing masses of "Bad Gateway" (502) errors caused by excessive LLM API calls.

## Root Causes Identified

1. **Auto-scanning running every 2 seconds** - The `useAutoRepair` hook was automatically scanning all files for errors every 2 seconds, making continuous LLM calls
2. **No rate limiting** - Multiple AI features (component generation, code improvement, error repair, etc.) were making unlimited concurrent LLM requests
3. **No error circuit breaker** - Failed requests would retry immediately without backing off
4. **No request throttling** - All AI operations competed for the same gateway resources

## Solutions Implemented

### 1. Rate Limiting System (`src/lib/rate-limiter.ts`)
- **Per-category rate limiting**: Different limits for different AI operations
- **Time windows**: Tracks requests over rolling 60-second windows
- **Automatic cleanup**: Removes stale tracking data
- **Priority queue support**: High-priority requests can retry with backoff
- **Status tracking**: Monitor remaining capacity and reset times

Configuration:
- **AI Operations**: Max 3 requests per minute
- **Error Scanning**: Max 1 request per 30 seconds

### 2. Protected LLM Service (`src/lib/protected-llm-service.ts`)
- **Error tracking**: Monitors consecutive failures
- **Circuit breaker**: Pauses all requests after 5 consecutive errors
- **User-friendly error messages**: Converts technical errors to actionable messages
- **Automatic recovery**: Error count decreases on successful calls
- **Request categorization**: Groups related operations for better rate limiting

### 3. Disabled Automatic Scanning
- **Removed automatic useEffect trigger** in `useAutoRepair`
- **Manual scanning only**: Users must explicitly click "Scan" button
- **Rate-limited when triggered**: Even manual scans respect rate limits

### 4. Updated All AI Services
- **ai-service.ts**: All methods now use `ProtectedLLMService`
- **error-repair-service.ts**: Code repair uses rate limiting
- **Consistent error handling**: All services handle 502/429 errors gracefully

## Benefits

1. **No more cascading failures**: Rate limiting prevents overwhelming the gateway
2. **Better user experience**: Clear error messages explain what went wrong
3. **Automatic recovery**: Circuit breaker allows system to recover from issues
4. **Resource efficiency**: Prevents wasted requests that would fail anyway
5. **Predictable behavior**: Users understand when operations might be delayed

## How It Works Now

### Normal Operation
1. User triggers an AI feature (generate component, improve code, etc.)
2. Request goes through `ProtectedLLMService`
3. Rate limiter checks if request is allowed
4. If allowed, request proceeds
5. If rate-limited, user sees friendly message about slowing down

### Error Handling
1. If LLM call fails with 502/Bad Gateway:
   - User sees: "Service temporarily unavailable - please wait a moment"
   - Error count increases
   - Request is blocked by rate limiter for the category

2. If too many consecutive errors (5+):
   - Circuit breaker trips
   - All AI operations pause
   - User sees: "AI service temporarily unavailable due to repeated errors"

3. Recovery:
   - Successful requests decrease error count
   - After error count drops, circuit breaker resets
   - Normal operation resumes

### Manual Controls
Users can check AI service status:
```javascript
const stats = ProtectedLLMService.getStats()
// Returns: { totalCalls, errorCount, isPaused }
```

Users can manually reset if needed:
```javascript
ProtectedLLMService.reset()
// Clears all rate limits and error counts
```

## Testing the Fix

1. **Verify no automatic scanning**: Open the app - no LLM calls should fire automatically
2. **Test rate limiting**: Try generating 5 components quickly - should see rate limit message
3. **Test error recovery**: If you hit an error, next successful call should work
4. **Check manual scan**: Error panel scan button should work with rate limiting

## Monitoring

Watch the browser console for:
- `LLM call failed (category): error` - Individual failures
- `Rate limit exceeded for llm-category` - Rate limiting in action
- `Too many LLM errors detected` - Circuit breaker activation

## Future Improvements

1. **Retry queue**: Queue rate-limited requests and auto-retry
2. **Progressive backoff**: Increase delays after repeated failures
3. **Request deduplication**: Prevent identical simultaneous requests
4. **Usage analytics**: Track which features use most AI calls
5. **User quotas**: Per-user rate limiting for multi-tenant deployments

## Files Modified

- `/src/lib/rate-limiter.ts` (NEW)
- `/src/lib/protected-llm-service.ts` (NEW)
- `/src/lib/ai-service.ts` (UPDATED - now uses rate limiting)
- `/src/lib/error-repair-service.ts` (UPDATED - now uses rate limiting)
- `/src/hooks/use-auto-repair.ts` (UPDATED - disabled automatic scanning)
