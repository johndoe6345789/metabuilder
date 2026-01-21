# Error Handling & Boundaries Guide

This document describes the comprehensive error handling system in MetaBuilder, including error boundaries, retry logic, error categorization, and recovery strategies.

## Overview

MetaBuilder implements a production-grade error handling system with:

- **Error Boundaries**: React Error Boundaries that catch and display component errors
- **Retryable Error Boundaries**: Enhanced error boundaries with automatic retry for transient failures
- **Error Categorization**: Automatic categorization of errors (network, auth, permission, etc.)
- **Retry Logic**: Exponential backoff with configurable retry strategies
- **User-Friendly Messages**: Context-specific error messages for different error types
- **Error Recovery**: Suggested actions based on error category

## Components

### 1. ErrorBoundary

Basic React error boundary component for catching component rendering errors.

**Location**: `src/components/ErrorBoundary.tsx`

**Features**:
- Catches JavaScript errors in child component tree
- Displays user-friendly error UI with technical details in dev mode
- Manual retry and page reload buttons
- Error count tracking
- Error reporting integration

**Usage**:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary context={{ component: 'App' }}>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

**With HOC**:

```typescript
import { withErrorBoundary } from '@/components/ErrorBoundary'

const ProtectedComponent = withErrorBoundary(YourComponent)
```

### 2. RetryableErrorBoundary

Enhanced error boundary with automatic retry logic for transient failures.

**Location**: `src/components/RetryableErrorBoundary.tsx`

**Features**:
- Catches component errors
- Automatic retry for retryable errors (network, timeout, 5xx)
- Exponential backoff between retries
- Retry countdown display
- Error categorization with visual indicators
- Color-coded UI based on error type
- Manual retry and page reload options
- Support contact information
- Development mode error details

**Error Types with Visual Indicators**:

| Category | Icon | Color | When Used |
|----------|------|-------|-----------|
| Network | 🌐 | Orange | Network failures, offline |
| Authentication | 🔐 | Pink | Auth/session errors (401, 403) |
| Permission | 🚫 | Red | Access denied (403) |
| Validation | ⚠️ | Yellow | Invalid input (400) |
| Not Found | 🔍 | Blue | Resource not found (404) |
| Conflict | ⚡ | Orange | Duplicate/conflict (409) |
| Rate Limit | ⏱️ | Light Blue | Too many requests (429) |
| Server | 🖥️ | Red | Server errors (5xx) |
| Timeout | ⏳ | Orange | Request timeout (408) |

**Usage**:

```typescript
import { RetryableErrorBoundary } from '@/components/RetryableErrorBoundary'

export function AdminTools() {
  return (
    <RetryableErrorBoundary
      componentName="AdminTools"
      maxAutoRetries={3}
      initialRetryDelayMs={1000}
      maxRetryDelayMs={8000}
      showSupportInfo
      supportEmail="support@metabuilder.dev"
    >
      <SchemaEditor />
      <WorkflowManager />
    </RetryableErrorBoundary>
  )
}
```

**With HOC**:

```typescript
import { withRetryableErrorBoundary } from '@/components/RetryableErrorBoundary'

const ProtectedComponent = withRetryableErrorBoundary(YourComponent, {
  componentName: 'AdminPanel',
  maxAutoRetries: 3,
})
```

**Props**:

```typescript
interface RetryableErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode                    // Custom fallback UI
  onError?: (error, errorInfo) => void   // Error callback
  context?: Record<string, unknown>      // Error reporting context
  maxAutoRetries?: number                // Max auto-retries (default: 3)
  initialRetryDelayMs?: number           // Initial retry delay (default: 1000ms)
  maxRetryDelayMs?: number               // Max retry delay (default: 8000ms)
  componentName?: string                 // Component name for debugging
  showSupportInfo?: boolean              // Show support contact (default: true)
  supportEmail?: string                  // Support email address
}
```

## Error Categorization

The error reporting system automatically categorizes errors into 10 types:

### Network
- **Indicators**: "network", "fetch", "offline" in message
- **Retryable**: Yes
- **Suggested Action**: "Check your internet connection and try again"

### Authentication
- **Indicators**: 401 status, "auth", "unauthorized" in message
- **Retryable**: No
- **Suggested Action**: "Log in again or refresh your credentials"

### Permission
- **Indicators**: 403 status, "permission", "forbidden" in message
- **Retryable**: No
- **Suggested Action**: "Contact your administrator for access"

### Validation
- **Indicators**: 400 status, "validation", "invalid" in message
- **Retryable**: No
- **Suggested Action**: "Please verify your input and try again"

### Not Found
- **Indicators**: 404 status, "not found" in message
- **Retryable**: No
- **Suggested Action**: "The requested resource no longer exists"

### Conflict
- **Indicators**: 409 status, "conflict", "duplicate" in message
- **Retryable**: No
- **Suggested Action**: "This resource already exists. Please use a different name"

### Rate Limit
- **Indicators**: 429 status, "rate", "too many" in message
- **Retryable**: Yes
- **Suggested Action**: "Too many requests. Please wait a moment and try again"

### Server
- **Indicators**: 5xx status, "server" in message
- **Retryable**: Yes (for 502, 503, 504; not 500)
- **Suggested Action**: "The server is experiencing issues. Please try again later"

### Timeout
- **Indicators**: 408 status, "timeout" in message
- **Retryable**: Yes
- **Suggested Action**: "Request took too long. Please try again"

### Unknown
- **Indicators**: All other errors
- **Retryable**: No
- **Suggested Action**: "Please try again or contact support"

## Error Reporting

### ErrorReporting Service

The `errorReporting` singleton handles error categorization, reporting, and user-friendly messages.

**Location**: `src/lib/error-reporting.ts`

**Key Methods**:

```typescript
// Report an error
const report = errorReporting.reportError(error, context)

// Get user-friendly message
const message = errorReporting.getUserMessage(error, category)

// Query errors
const allErrors = errorReporting.getErrors()
const networkErrors = errorReporting.getErrorsByCategory('network')
const retryableErrors = errorReporting.getRetryableErrors()

// Clear error history
errorReporting.clearErrors()
```

**Error Report Structure**:

```typescript
interface ErrorReport {
  id: string                        // Unique error ID
  message: string                   // Error message
  code?: string                     // Error code (if applicable)
  statusCode?: number               // HTTP status code (if applicable)
  category: ErrorCategory           // Error category
  stack?: string                    // Stack trace
  context: ErrorReportContext       // Additional context
  timestamp: Date                   // When error occurred
  isDevelopment: boolean            // Development mode flag
  isRetryable: boolean              // Can this error be retried?
  suggestedAction?: string          // Suggested recovery action
}
```

**Hook for Components**:

```typescript
import { useErrorReporting } from '@/lib/error-reporting'

export function MyComponent() {
  const { reportError, getUserMessage } = useErrorReporting()

  const handleError = (error: Error) => {
    const report = reportError(error, { component: 'MyComponent' })
    console.log(`Error: ${report.message}, Retryable: ${report.isRetryable}`)
  }
}
```

## Async Error Boundary

Utilities for wrapping async operations with error boundaries, retry logic, and error reporting.

**Location**: `src/lib/async-error-boundary.ts`

**Key Functions**:

### withAsyncErrorBoundary

Wraps an async operation with retry logic.

```typescript
import { withAsyncErrorBoundary } from '@/lib/async-error-boundary'

try {
  const data = await withAsyncErrorBoundary(
    () => fetch('/api/data').then(r => r.json()),
    {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      timeoutMs: 10000,
      context: { action: 'fetchData' },
      onError: (error, attempt) => {
        console.log(`Attempt ${attempt} failed:`, error.message)
      },
      onRetry: (attempt, error) => {
        console.log(`Retrying attempt ${attempt}`)
      },
      onRetrySuccess: (attempt) => {
        console.log(`Succeeded after ${attempt} retries`)
      },
    }
  )
} catch (error) {
  console.error('All retries exhausted:', error)
}
```

### fetchWithErrorBoundary

Fetch with automatic retry and error handling.

```typescript
import { fetchWithErrorBoundary } from '@/lib/async-error-boundary'

const response = await fetchWithErrorBoundary('/api/data', {}, {
  maxRetries: 3,
  timeoutMs: 10000,
})
```

### tryAsyncOperation

Safe async wrapper that never throws.

```typescript
import { tryAsyncOperation } from '@/lib/async-error-boundary'

const result = await tryAsyncOperation(
  () => fetch('/api/data').then(r => r.json()),
  { maxRetries: 3 }
)

if (result.success) {
  console.log('Data:', result.data)
} else {
  console.error('Failed:', result.error)
}
```

### useAsyncErrorHandler

Hook for React components.

```typescript
import { useAsyncErrorHandler } from '@/lib/async-error-boundary'

export function MyComponent() {
  const { execute, fetchWithRetry, tryOperation } = useAsyncErrorHandler()

  const handleFetch = async () => {
    try {
      const result = await execute(
        () => fetch('/api/data').then(r => r.json()),
        { maxRetries: 3 }
      )
    } catch (error) {
      console.error('Failed:', error)
    }
  }
}
```

## Retry Logic

### Exponential Backoff Algorithm

The system uses exponential backoff with jitter to retry failed operations:

```
delay = min(initialDelay * (backoffMultiplier ^ attempt), maxDelay)
```

**Default Configuration**:
- Initial Delay: 100ms
- Max Delay: 5000ms
- Backoff Multiplier: 2
- Max Retries: 3

**Example Retry Schedule**:
- Attempt 1: 100ms
- Attempt 2: 200ms
- Attempt 3: 400ms
- Attempt 4: 800ms (then max 5000ms)

### Retryable Status Codes

Only certain HTTP status codes trigger automatic retry:

- **408**: Request Timeout
- **429**: Too Many Requests (Rate Limit)
- **500**: Internal Server Error
- **502**: Bad Gateway
- **503**: Service Unavailable
- **504**: Gateway Timeout

Non-retryable codes (4xx except above): Return immediately without retry.

## Best Practices

### 1. Wrap Root Components

Always wrap root layout components with error boundaries:

```typescript
// Root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RetryableErrorBoundary componentName="RootLayout">
          {children}
        </RetryableErrorBoundary>
      </body>
    </html>
  )
}
```

### 2. Granular Error Boundaries

Use smaller error boundaries around critical features:

```typescript
export function AdminPanel() {
  return (
    <div>
      <RetryableErrorBoundary componentName="SchemaEditor">
        <SchemaEditor />
      </RetryableErrorBoundary>
      <RetryableErrorBoundary componentName="WorkflowManager">
        <WorkflowManager />
      </RetryableErrorBoundary>
    </div>
  )
}
```

### 3. Async Operations

Wrap async operations with error boundaries for better error handling:

```typescript
const handleSave = async () => {
  try {
    const result = await withAsyncErrorBoundary(
      () => api.save(data),
      {
        maxRetries: 2,
        context: { action: 'save' },
        onError: (error) => {
          toast.error(errorReporting.getUserMessage(error))
        },
      }
    )
  } catch (error) {
    console.error('Save failed:', error)
  }
}
```

### 4. Development vs Production

Error details are automatically managed:

- **Development**: Full error messages and stack traces shown
- **Production**: User-friendly messages, technical details hidden

No code changes needed; set `NODE_ENV=production` to enable production mode.

### 5. Error Context

Always provide context for error reporting:

```typescript
<RetryableErrorBoundary
  context={{
    userId: currentUser.id,
    tenantId: currentTenant.id,
    feature: 'schemaEditor',
  }}
>
  <SchemaEditor />
</RetryableErrorBoundary>
```

## Error Recovery Strategies by Type

### Network Errors
- **Automatic**: Retry with exponential backoff
- **Manual**: User clicks "Try Again"
- **If Persists**: Show "Check your connection" and support contact

### Authentication Errors
- **Automatic**: No automatic retry
- **Manual**: User logs in again
- **If Persists**: Redirect to login page

### Permission Errors
- **Automatic**: No automatic retry
- **Manual**: Contact administrator
- **If Persists**: Show permission request UI

### Validation Errors
- **Automatic**: No automatic retry
- **Manual**: User fixes input and retries
- **If Persists**: Show validation error details

### Rate Limit Errors
- **Automatic**: Retry with longer exponential backoff
- **Manual**: User waits and retries
- **If Persists**: Show rate limit exceeded message

### Server Errors
- **Automatic**: Retry with exponential backoff
- **Manual**: User clicks "Try Again"
- **If Persists**: Show server error and support contact

## Monitoring & Analytics

### Error Tracking

Development:
```typescript
const errors = errorReporting.getErrors()
const networkErrors = errorReporting.getErrorsByCategory('network')
```

Production:
```typescript
// TODO: Implement monitoring integration (Sentry, DataDog, etc.)
// See sendToMonitoring() in error-reporting.ts
```

### Error Statistics

Query errors by category:

```typescript
const categories = ['network', 'auth', 'server', 'timeout']
categories.forEach(category => {
  const errors = errorReporting.getErrorsByCategory(category)
  console.log(`${category}: ${errors.length} errors`)
})
```

## Common Error Scenarios

### Scenario 1: Network Timeout

```
User Action: Click "Save"
↓
API Request Timeout (408)
↓
Error Category: timeout
↓
Is Retryable: Yes
↓
Action: Automatic retry in 1s
↓
Retry Succeeds: User sees success message
OR
All Retries Fail: Show "Request took too long" + retry button
```

### Scenario 2: Permission Denied

```
User Action: Access Admin Panel
↓
API Returns 403 Forbidden
↓
Error Category: permission
↓
Is Retryable: No
↓
Show: "You do not have permission" + contact admin
↓
No Automatic Retry
```

### Scenario 3: Server Error

```
User Action: Load Dashboard
↓
API Returns 503 Service Unavailable
↓
Error Category: server
↓
Is Retryable: Yes
↓
Action: Automatic retry with exponential backoff
↓
Shows: "Retrying in 2s..." countdown
↓
Success or Exhausted: User sees result
```

## Testing Error Boundaries

### Manual Testing

1. Throw an error in component render:
```typescript
if (someCondition) {
  throw new Error('Test error')
}
```

2. Test async errors using `withAsyncErrorBoundary`:
```typescript
const result = await withAsyncErrorBoundary(
  () => Promise.reject(new Error('Test error')),
  { maxRetries: 1 }
)
```

3. Trigger different error categories:
- Network: `throw new Error('Network error')`
- Auth: `throw new Error('401: Unauthorized')`
- Server: `throw new Error('500: Internal Server Error')`

### Automated Testing

See `e2e/` directory for Playwright tests covering:
- Error boundary activation
- Retry logic and countdown
- Error categorization
- Recovery actions

## Future Enhancements

- [ ] Integration with Sentry/DataDog for production monitoring
- [ ] Error aggregation dashboard
- [ ] Automatic error recovery rules
- [ ] A/B testing of error messages
- [ ] Error analytics and reporting
- [ ] Integration with support ticketing system
- [ ] Offline error queue for offline-first scenarios

## API Reference

See inline documentation in:
- `src/components/ErrorBoundary.tsx` - Basic error boundary
- `src/components/RetryableErrorBoundary.tsx` - Retryable error boundary
- `src/lib/error-reporting.ts` - Error reporting service
- `src/lib/async-error-boundary.ts` - Async error utilities
- `src/lib/api/retry.ts` - Low-level retry logic
