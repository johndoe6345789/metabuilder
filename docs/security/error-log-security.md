# Error Log System Security Considerations

## Overview
The error log system implements several security measures to ensure proper access control and data protection across the multi-tenant architecture.

## Access Control

### Role-Based Access
- **SuperGod (Level 6)**: Full access to all error logs across all tenants
- **God (Level 5)**: Access only to error logs within their own tenant scope
- **Lower Levels**: No direct access to the error log system

### Implementation
The `ErrorLogsTab` component accepts an optional `user` prop to determine access scope:

```typescript
const isSuperGod = user?.role === 'supergod'
const tenantId = user?.tenantId

// SuperGod sees all logs, God sees only their tenant's logs
const options = isSuperGod ? {} : { tenantId }
const data = await Database.getErrorLogs(options)
```

## Data Isolation

### Tenant Scoping
Error logs can be associated with a specific tenant via the `tenantId` field. When a God-tier user accesses error logs, the system automatically filters to show only logs from their tenant.

**Database Query**:
```typescript
// In get-error-logs.ts
if (options?.tenantId) {
  logs = logs.filter(log => log.tenantId === options.tenantId)
}
```

### Multi-Tenant Safety
All error logs include optional tenant context:
- `tenantId`: Links the error to a specific tenant
- `userId`: Links the error to a specific user
- `username`: Human-readable user identifier

This ensures:
1. God-tier users can only see errors from their tenant
2. SuperGod can audit errors across all tenants
3. Errors can be traced to specific users if needed

## Feature Restrictions

### SuperGod-Only Features
Certain dangerous operations are restricted to SuperGod level:
- **Delete logs**: Only SuperGod can permanently delete error log entries
- **Clear all logs**: Bulk deletion operations are SuperGod-only
- **Cross-tenant view**: Only SuperGod sees the tenant identifier in log displays

### God-Level Features  
God-tier users have limited capabilities:
- **View logs**: Can view error logs scoped to their tenant
- **Resolve logs**: Can mark errors as resolved
- **No deletion**: Cannot delete error logs

## Sensitive Data Handling

### Stack Traces
Stack traces may contain sensitive information:
- Displayed in collapsible `<details>` elements
- Only visible when explicitly expanded by the user
- Limited to authenticated users with appropriate roles

### Context Data
Additional context (JSON) is similarly protected:
- Hidden by default in a collapsible section
- Parsed and formatted for readability
- Should not contain passwords or API keys (implementation responsibility)

## Best Practices for Error Logging

### What to Log
✅ **Safe to log**:
- Error messages and types
- Source file/component names
- User IDs (not passwords or tokens)
- Tenant IDs
- Timestamps

❌ **Never log**:
- Passwords (even hashed)
- API keys or secrets
- Personal identifiable information (PII) beyond user IDs
- Credit card numbers
- Session tokens

### Using the Logger
```typescript
import { logError } from '@/lib/logging'

try {
  // risky operation
} catch (error) {
  await logError(error, {
    level: 'error',
    source: 'MyComponent.tsx',
    userId: user.id,
    username: user.username,
    tenantId: user.tenantId,
    context: {
      operation: 'updateUser',
      // Only non-sensitive context
    }
  })
}
```

## Audit Trail

### Resolution Tracking
When an error is marked as resolved:
- `resolved`: Set to `true`
- `resolvedAt`: Timestamp of resolution
- `resolvedBy`: Username who resolved it

This creates an audit trail of who addressed which errors.

## Future Considerations

### Encryption at Rest
For highly sensitive deployments, consider:
- Encrypting error messages in the database
- Using a separate, isolated error logging service
- Implementing log rotation policies

### Rate Limiting
Currently not implemented, but consider:
- Limiting error log creation to prevent DoS via logging
- Throttling error queries for non-SuperGod users

### Compliance
For GDPR/CCPA compliance:
- Implement automatic log expiration after a defined period
- Allow users to request deletion of their error logs
- Ensure PII is properly anonymized in error messages
