# Permissions System - Quick Reference

## Permission Levels

```
0, 1 = PUBLIC      (no authentication)
2    = USER        (authenticated user)
3    = MODERATOR   (moderator access)
4    = ADMIN       (administrator)
5    = GOD         (super admin)
6    = SUPERGOD    (system owner)
```

## Lua Quick Reference

### Import
```lua
local permissions = require("permissions")
```

### Initialize
```lua
permissions.initialize_flags({beta = true})
permissions.enable_database()
```

### Check Access
```lua
local result = permissions.check_package_access(userLevel, {
  enabled = true,
  minLevel = 3,
  databaseRequired = true
})

if result.allowed then
  -- proceed
else
  print(result.reason)
end
```

### Feature Flags
```lua
permissions.enable_flag("new_ui")
permissions.disable_flag("old_feature")
if permissions.is_flag_enabled("beta") then
  -- beta code
end
```

### Database
```lua
permissions.enable_database()
permissions.disable_database()
if permissions.is_database_enabled() then
  -- db operations
end
```

## TypeScript Quick Reference

### Import
```typescript
import { checkPackagePermissions, permissionManager } from '@/lib/packages/permissions'
```

### Check Access
```typescript
const context = {
  userLevel: 3,
  featureFlags: { beta: true },
  databaseEnabled: true
}

const result = checkPackagePermissions(context, {
  enabled: true,
  minLevel: 3,
  databaseRequired: true
})
```

### React Hook
```typescript
import { usePermissions } from '@/lib/packages/permissions'

function MyComponent() {
  const perms = usePermissions({ userLevel: 3 })

  const canAccess = perms.checkComponent({
    enabled: true,
    minLevel: 2
  })

  if (!canAccess.allowed) {
    return <div>{canAccess.reason}</div>
  }

  return <div>Content</div>
}
```

## Metadata Schema

### Package Level
```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 3,
    "databaseRequired": true
  }
}
```

### Component Level
```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 2,
    "components": {
      "MyComponent": {
        "enabled": true,
        "minLevel": 4,
        "requireDatabase": true,
        "featureFlags": ["beta"]
      }
    }
  }
}
```

## Common Patterns

### Public Package
```json
{"permissions": {"enabled": true, "minLevel": 0}}
```

### Auth Required
```json
{"permissions": {"enabled": true, "minLevel": 2}}
```

### Admin Only
```json
{"permissions": {"enabled": true, "minLevel": 4}}
```

### With Database
```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 2,
    "databaseRequired": true
  }
}
```

### With Feature Flags
```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 2,
    "components": {
      "BetaFeature": {
        "enabled": true,
        "minLevel": 2,
        "featureFlags": ["beta_ui"]
      }
    }
  }
}
```

### Disabled Component
```json
{
  "permissions": {
    "components": {
      "OldFeature": {
        "enabled": false,
        "minLevel": 2
      }
    }
  }
}
```

## Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "Resource is currently disabled" | enabled: false | Enable the resource |
| "Insufficient permission level" | User level too low | Increase user level or lower minLevel |
| "Database is required but not enabled" | databaseRequired: true but DB off | Enable database or remove requirement |
| "Required feature flag 'x' is not enabled" | Missing feature flag | Enable the flag |

## Testing

### Lua Test
```lua
describe("Test", function()
  it("checks access", function()
    local result = permissions.check_access(3, {
      enabled = true,
      minLevel = 2
    })
    assert.is_true(result.allowed)
  end)
end)
```

### TypeScript Test
```typescript
test('checks access', () => {
  const result = checkPackagePermissions({
    userLevel: 3,
    featureFlags: {},
    databaseEnabled: true
  }, {
    enabled: true,
    minLevel: 2
  })

  expect(result.allowed).toBe(true)
})
```

## File Locations

### Lua
- `packages/shared/seed/scripts/permissions/`
- Tests: `packages/shared/seed/scripts/permissions/tests/`

### TypeScript
- `frontends/nextjs/src/lib/packages/permissions/`

### Documentation
- Full Guide: `packages/shared/PERMISSIONS_GUIDE.md`
- Module README: `packages/shared/seed/scripts/permissions/README.md`
- TypeScript README: `frontends/nextjs/src/lib/packages/permissions/README.md`

## See Also

- [Full Permission Guide](PERMISSIONS_GUIDE.md)
- [Implementation Report](../../docs/reports/PHASE_5_PERMISSIONS_IMPLEMENTATION.md)
