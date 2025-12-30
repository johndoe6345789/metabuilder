# Permission System - TypeScript/Next.js

TypeScript implementation of the MetaBuilder permission system for Next.js frontend.

## Quick Start

```typescript
import { checkPackagePermissions, PermissionContext } from '@/lib/packages/permissions'

const context: PermissionContext = {
  userLevel: 4, // Admin
  featureFlags: { beta_mode: true },
  databaseEnabled: true,
}

const packagePerms = {
  enabled: true,
  minLevel: 3,
  databaseRequired: true,
}

const result = checkPackagePermissions(context, packagePerms)
if (result.allowed) {
  console.log('Access granted')
} else {
  console.log('Access denied:', result.reason)
}
```

## React Hook

```typescript
import { usePermissions } from '@/lib/packages/permissions'

function MyComponent() {
  const permissions = usePermissions({ userLevel: 3 })

  const canAccessFeature = permissions.checkComponent({
    enabled: true,
    minLevel: 2,
    featureFlags: ['beta_ui'],
  })

  if (!canAccessFeature.allowed) {
    return <div>Access denied: {canAccessFeature.reason}</div>
  }

  return <div>Feature content</div>
}
```

## Permission Manager

```typescript
import { permissionManager } from '@/lib/packages/permissions'

// Initialize flags
permissionManager.initializeFlags({
  beta_mode: true,
  advanced_ui: false,
})

// Enable a flag
permissionManager.enableFlag('new_feature')

// Check database status
const dbStatus = permissionManager.getDatabaseStatus()
console.log(dbStatus.message)

// Toggle database
permissionManager.disableDatabase()
```

## API

### Functions

- `checkPackagePermissions(context, permissions)` - Check package access
- `checkComponentPermissions(context, permissions)` - Check component access
- `checkAccess(userLevel, permissions, flags, dbEnabled)` - Low-level check
- `getAccessibleComponents(context, componentPerms)` - Filter components
- `getPermissionDenialMessage(result)` - Get user-friendly message
- `roleToLevel(role)` - Convert role string to level
- `levelToRole(level)` - Convert level to role string

### Classes

- `PermissionManager` - Singleton for state management
  - Feature flag management
  - Database toggle
  - State access

### Hooks

- `usePermissions(options)` - React hook for permissions
  - Auto-refresh support
  - Component-friendly API
  - State management

## Types

```typescript
type PermissionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface ComponentPermission {
  enabled: boolean
  minLevel: PermissionLevel
  featureFlags?: string[]
  requireDatabase?: boolean
}

interface PackagePermissions {
  enabled: boolean
  minLevel: PermissionLevel
  databaseRequired?: boolean
  components?: Record<string, ComponentPermission>
}

interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  requiredLevel?: PermissionLevel
}

interface PermissionContext {
  userLevel: PermissionLevel
  featureFlags?: Record<string, boolean>
  databaseEnabled?: boolean
}
```

## Examples

### Check Package with Feature Flags

```typescript
const context = {
  userLevel: 3,
  featureFlags: { kv_store: true },
  databaseEnabled: true,
}

const result = checkPackagePermissions(context, {
  enabled: true,
  minLevel: 3,
  databaseRequired: true,
})
```

### Filter Accessible Components

```typescript
const accessible = getAccessibleComponents(context, {
  ViewerComponent: { enabled: true, minLevel: 2 },
  EditorComponent: { enabled: true, minLevel: 4 },
  AdminComponent: { enabled: false, minLevel: 5 },
})
// Returns: ['ViewerComponent'] for user level 3
```

### React Component with Permissions

```typescript
function ProtectedFeature() {
  const permissions = usePermissions({ userLevel: 3 })

  const canAccess = permissions.checkComponent({
    enabled: true,
    minLevel: 3,
    featureFlags: ['beta'],
  })

  if (!canAccess.allowed) {
    return <AccessDenied reason={canAccess.reason} />
  }

  return <FeatureContent />
}
```

## See Also

- [Lua Permission System](../../../../packages/shared/PERMISSIONS_GUIDE.md)
- [Package Metadata Schema](../../packages/README.md)
