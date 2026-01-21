# Error Boundaries Quick Start Guide

Quick reference for using error boundaries and retry logic in MetaBuilder.

## Basic Usage

### Wrap a Component

```typescript
import { RetryableErrorBoundary } from '@/components/RetryableErrorBoundary'

export function MyComponent() {
  return (
    <RetryableErrorBoundary componentName="MyComponent">
      <YourContent />
    </RetryableErrorBoundary>
  )
}
```

### Use HOC Pattern

```typescript
import { withRetryableErrorBoundary } from '@/components/RetryableErrorBoundary'

const ProtectedComponent = withRetryableErrorBoundary(YourComponent, {
  componentName: 'YourComponent',
  maxAutoRetries: 3,
})
```

### Wrap Async Operations

```typescript
import { withAsyncErrorBoundary } from '@/lib/async-error-boundary'

const data = await withAsyncErrorBoundary(
  () => fetch('/api/data').then(r => r.json()),
  { maxRetries: 3 }
)
```

## Error Categories

| Error | Icon | Color | Retryable |
|-------|------|-------|-----------|
| Network | 🌐 | Orange | Yes |
| Auth | 🔐 | Pink | No |
| Permission | 🚫 | Red | No |
| Validation | ⚠️ | Yellow | No |
| Not Found | 🔍 | Blue | No |
| Conflict | ⚡ | Orange | No |
| Rate Limit | ⏱️ | Light Blue | Yes |
| Server | 🖥️ | Red | Yes |
| Timeout | ⏳ | Orange | Yes |

## Common Examples

### Protect Admin Panel

```typescript
<RetryableErrorBoundary
  componentName="AdminPanel"
  maxAutoRetries={3}
  showSupportInfo
  supportEmail="admin@company.com"
>
  <SchemaEditor />
  <WorkflowManager />
  <DatabaseManager />
</RetryableErrorBoundary>
```

### Save with Retry

```typescript
const handleSave = async (data) => {
  try {
    await withAsyncErrorBoundary(
      () => api.save(data),
      {
        maxRetries: 2,
        context: { action: 'save' },
      }
    )
    showSuccess('Saved!')
  } catch (error) {
    showError('Failed to save')
  }
}
```

### Query with Timeout

```typescript
const data = await withAsyncErrorBoundary(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxRetries: 3,
    timeoutMs: 10000,
    context: { query: 'listUsers' },
  }
)
```

## Props Reference

### RetryableErrorBoundary Props

```typescript
interface Props {
  children: ReactNode                    // Content to protect
  maxAutoRetries?: number               // Default: 3
  initialRetryDelayMs?: number          // Default: 1000ms
  maxRetryDelayMs?: number              // Default: 8000ms
  componentName?: string                // For debugging
  showSupportInfo?: boolean             // Default: true
  supportEmail?: string                 // Email to display
  fallback?: ReactNode                  // Custom error UI
  onError?: (error, errorInfo) => void // Error callback
  context?: Record<string, any>        // Error context
}
```

### withAsyncErrorBoundary Options

```typescript
interface Options {
  maxRetries?: number          // Default: 3
  initialDelayMs?: number      // Default: 100ms
  maxDelayMs?: number          // Default: 5000ms
  timeoutMs?: number           // Optional timeout
  context?: Record<string, any> // Error context
  reportError?: boolean        // Report to monitoring
  onError?: (error, attempt) => void
  onRetry?: (attempt, error) => void
  onRetrySuccess?: (attempt) => void
}
```

## Error Messages (Automatic)

- **Network**: "Check your internet connection and try again."
- **Auth**: "Your session has expired. Please log in again."
- **Permission**: "You do not have permission."
- **Validation**: "Please verify your input."
- **Not Found**: "The resource was not found."
- **Conflict**: "This resource already exists."
- **Rate Limit**: "Too many requests. Please wait."
- **Server**: "Server error. Our team has been notified."
- **Timeout**: "Request took too long."

## Retry Behavior

**Automatic Retries** (for network, timeout, rate-limit, server errors):
1. Error occurs
2. Automatic retry scheduled (1s delay)
3. Display "Retrying in Xs..." countdown
4. Attempt again
5. On success → Clear error
6. On failure → Try next retry or show error UI

**Manual Options** (always available):
- **Try Again**: User-triggered retry
- **Reload Page**: Full page refresh
- **Support**: Contact support email

## Testing

```typescript
// Test network error
throw new Error('Network error')

// Test permission error
throw new Error('403 Forbidden')

// Test server error (retryable)
throw new Error('503 Service Unavailable')

// Test async operation
const result = await withAsyncErrorBoundary(
  () => Promise.reject(new Error('Test')),
  { maxRetries: 1 }
)
```

## Best Practices

✅ Wrap root components with error boundaries
✅ Use granular boundaries for features
✅ Provide context for error reporting
✅ Use HOC for reusable wrappers
✅ Configure appropriate retry counts
✅ Show support information in UI
✅ Test error scenarios manually

❌ Don't catch errors too broadly
❌ Don't retry indefinitely
❌ Don't hide errors in development
❌ Don't use same error boundary for everything

## Monitoring

```typescript
import { useErrorReporting } from '@/lib/error-reporting'

const { reportError, getUserMessage } = useErrorReporting()

const report = reportError(error, { userId: '123' })
console.log(report.category)      // 'network'
console.log(report.isRetryable)   // true
```

## Integration Points

### Root Layout
```typescript
// Already wrapped in Providers component
// Provides app-wide error catching
```

### Admin Tools
```typescript
// To be wrapped in Phase 5.3
<RetryableErrorBoundary componentName="AdminTools">
  {adminTools}
</RetryableErrorBoundary>
```

### API Calls
```typescript
// Already using retry.ts in fetch layer
// Enhanced with async-error-boundary.ts
```

## Documentation

- Full guide: `docs/ERROR_HANDLING.md`
- API reference: Inline JSDoc comments
- Tests: `src/lib/error-reporting.test.ts`
- Examples: This file and ERROR_HANDLING.md

## Next Steps

1. Review `docs/ERROR_HANDLING.md` for detailed guide
2. Use examples above for your components
3. Add error boundaries as needed
4. Test with manual error injection
5. Monitor error reports in development

Need help? See `docs/ERROR_HANDLING.md` or check inline documentation in source files.
