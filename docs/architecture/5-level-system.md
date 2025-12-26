# 6-Level Architecture Guide

MetaBuilder implements a sophisticated **6-level permission system** that controls access to features and functionality based on user authorization levels.

## Overview

The 5-level architecture provides granular access control, allowing a single application instance to serve multiple user types with different capabilities:

```
Level 6: Supergod     └─ Complete system control, all features
        ↑
Level 5: God Mode     └─ Advanced system features, workflow execution
        ↑
Level 4: Admin        └─ Administrative functions, tenant management
        ↑
Level 3: Moderator    └─ Moderation desk, flag resolution, report review
        ↑
Level 2: User         └─ Standard authenticated user features
        ↑
Level 1: Public       └─ Unauthenticated access, read-only
```

## Permission Model

Each level **inherits all permissions from lower levels** and adds additional capabilities:

| Feature | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 | Level 6 |
|---------|---------|---------|---------|---------|---------|---------|
| View Public Data | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Authenticate | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Content | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Moderate Content | | | ✓ | ✓ | ✓ | ✓ |
| Manage Users | | | | ✓ | ✓ | ✓ |
| Run Workflows | | | | | ✓ | ✓ |
| System Configuration | | | | | | ✓ |
| System Monitoring | | | | | | ✓ |

## Level Descriptions

### Level 1: Public
- **Access**: Unauthenticated
- **Features**: Read-only data, public pages, login interface
- **Example Users**: Visitors, demo users
- **Restrictions**: No login required, limited features

### Level 2: User
- **Access**: Authenticated
- **Features**: Personal dashboard, content creation, profile management
- **Example Users**: Regular users, content creators
- **Restrictions**: Can only manage own content

### Level 3: Moderator
- **Access**: Moderator workspace (authenticated identity with community oversight)
- **Features**: Resolve flags, review reports, curate shared discussions, and apply warning paths
- **Example Users**: Community managers, trust and safety analysts
- **Restrictions**: No tenant-wide configuration or workflow authoring

### Level 4: Admin
- **Access**: Tenant administrator
- **Features**: Manage users, tenants, policies, and escalate moderation events
- **Example Users**: Tenant owners, ops leads
- **Restrictions**: System-wide configuration reserved for higher tiers

### Level 5: God Mode
- **Access**: Power user with advanced features
- **Features**: Workflow execution, advanced scripting, builder tooling, and package seeding
- **Example Users**: Technical leads, automation specialists
- **Restrictions**: Some infrastructure controls still blocked

### Level 6: Supergod
- **Access**: Full system control
- **Features**: All features including system configuration, DBAL access, role assignments, and audits
- **Example Users**: Instance owner, platform operator
- **Restrictions**: None (complete access)

## Frontend Routes

| Level | Route | Notes |
| --- | --- | --- |
| 1 | `/` | Public landing page |
| 2 | `/dashboard` | User workspace |
| 3 | `/admin` | Admin panel |
| 4 | `/builder` | God-tier builder |
| 5 | `/supergod` | Supergod console |
| - | `/login` | Unified sign-in and registration |

## Implementation

### Checking Permissions

Use the `canAccessLevel()` function to check if a user can access a feature:

```typescript
import { canAccessLevel } from '@/lib/auth'
import { useAuth } from '@/hooks'

export const AdminPanel = () => {
  const { user } = useAuth()
  
  // Check if user has Level 3 or higher
  if (!canAccessLevel(user.level, 3)) {
    return <AccessDenied />
  }
  
  return <AdminContent />
}
```

### Permission Gates in Components

```typescript
// Simple binary check
if (canAccessLevel(user.level, 3)) {
  showAdminFeatures()
}

// Multiple conditional features
const features = {
  basicDashboard: true,  // All levels
  contentEditor: user.level >= 2,
  userManagement: user.level >= 3,
  workflowEngine: user.level >= 4,
  systemConfig: user.level === 5,
}
```

### Backend Route Protection

```typescript
// API Route - middleware checks permission
import { validateRequest } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await validateRequest(req)
  
  // Require Level 3 access
  if (!canAccessLevel(user.level, 3)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Process admin request
  return handleAdminOperation(req)
}
```

## Multi-Tenant Isolation

Each user belongs to a **tenant**, providing data isolation:

```typescript
interface User {
  id: string
  email: string
  level: 1 | 2 | 3 | 4 | 5
  tenantId: string  // Data isolation
  tenant: Tenant
}
```

Queries automatically filter by tenant:

```typescript
// Only returns data for user's tenant
const userWorkflows = await db.getWorkflows(user.tenantId)
```

## Roles vs Levels

This system uses **levels** (hierarchical) rather than roles (flat):

```
// Hierarchical (Levels) - Used in MetaBuilder
if (user.level >= 3) { /* Has all lower permissions too */ }

// Flat (Roles) - Not used
if (user.hasRole('admin')) { /* Only admin, no inheritance */ }
```

## Database Schema

Users table with level column:

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  level    Int    // 1-5
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  tenantId String
}
```

## UI Components by Level

Different pages render based on access level:

```typescript
// App.tsx
export function AppOriginal() {
  const [user, setUser] = useState<User | null>(null)
  
  if (!user) {
    return <Level1 />  // Public interface
  }
  
  if (canAccessLevel(user.level, 5)) {
    return <Level5 />  // Supergod interface
  }
  if (canAccessLevel(user.level, 4)) {
    return <Level4 />  // God mode interface
  }
  if (canAccessLevel(user.level, 3)) {
    return <Level3 />  // Admin interface
  }
  
  return <Level2 />  // User interface
}
```

## Security Considerations

### Authentication First
- Always validate user identity
- Use secure password hashing (SHA-512)
- Implement session management

### Authorization Always
- Check permissions on **every** protected operation
- Never trust client-side permission checks alone
- Validate level on backend routes

### Audit Logging
- Log all Level 4+ operations
- Track permission elevations
- Monitor system changes

### Prevent Escalation
- Don't allow users to modify their own level
- Use protected database constraints
- Require admin approval for level changes

## Best Practices

✅ **Do:**
- Check permissions at component entry point
- Use consistent level numbers (1-5)
- Document which level can access features
- Audit high-level operations
- Test with different permission levels

❌ **Don't:**
- Trust client-side permission checks
- Mix roles and levels
- Allow self-service level elevation
- Skip permission checks for "security"
- Hardcode level numbers in components

## Testing Multi-Level Access

Test features at each level:

```typescript
const testLevels = [
  { level: 1, expect: 'public' },
  { level: 2, expect: 'user' },
  { level: 3, expect: 'admin' },
  { level: 4, expect: 'godmode' },
  { level: 5, expect: 'supergod' },
]

testLevels.forEach(({ level, expect }) => {
  it(`should show ${expect} for level ${level}`, () => {
    const user = { level, tenantId: 'test' }
    // Test rendering
  })
})
```

## Migration from Other Systems

If migrating from role-based access:

1. Map roles to levels
2. Create user migration script
3. Update component permission checks
4. Test at each level
5. Update documentation
6. Train users on new system

See related guides in `/docs/architecture/` for implementation patterns.
