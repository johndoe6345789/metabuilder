# MetaBuilder Permission System Guide

## Overview

The MetaBuilder permission system provides fine-grained access control for packages and components, allowing you to:

- Enable/disable entire packages or individual components
- Set minimum permission levels (0-6) for access control
- Require database connectivity for specific features
- Use feature flags for progressive rollout and A/B testing

## Permission Levels

The system uses a 7-level hierarchy:

| Level | Name | Description |
|-------|------|-------------|
| 0 | PUBLIC | No authentication required |
| 1 | PUBLIC | No authentication required (same as 0) |
| 2 | USER | Authenticated user |
| 3 | MODERATOR | Moderator access |
| 4 | ADMIN | Administrator access |
| 5 | GOD | Super administrator |
| 6 | SUPERGOD | System owner |

## Package Permissions

### Metadata Schema

Add a `permissions` field to your package's `metadata.json`:

```json
{
  "packageId": "my_package",
  "name": "My Package",
  "version": "1.0.0",
  "permissions": {
    "enabled": true,
    "minLevel": 3,
    "databaseRequired": true,
    "components": {
      "ComponentName": {
        "enabled": true,
        "minLevel": 4,
        "requireDatabase": true,
        "featureFlags": ["beta_feature"]
      }
    }
  }
}
```

### Field Descriptions

#### Package-Level Permissions

- **enabled** (boolean): Whether the package is currently active
- **minLevel** (0-6): Minimum permission level required to access the package
- **databaseRequired** (boolean, optional): Whether the package needs database connectivity

#### Component-Level Permissions

- **enabled** (boolean): Whether the component is currently active
- **minLevel** (0-6): Minimum permission level required to use this component
- **requireDatabase** (boolean, optional): Whether this component needs database connectivity
- **featureFlags** (string[], optional): List of feature flags that must be enabled

## Using the Permission System

### In Lua Scripts

```lua
local permissions = require("permissions")

-- Initialize system state
permissions.initialize_flags({
  beta_feature = true,
  advanced_mode = false
})
permissions.enable_database()

-- Check package access
local packagePerms = {
  enabled = true,
  minLevel = 3,
  databaseRequired = true
}

local userLevel = 4 -- Admin user
local result = permissions.check_package_access(userLevel, packagePerms)

if result.allowed then
  print("Access granted")
else
  print("Access denied: " .. result.reason)
  if result.requiredLevel then
    print("Required level: " .. result.requiredLevel)
  end
end

-- Check component access
local componentPerms = {
  enabled = true,
  minLevel = 2,
  featureFlags = {"beta_feature"}
}

result = permissions.check_component_access(userLevel, componentPerms)
```

### Feature Flag Management

```lua
local permissions = require("permissions")

-- Enable a feature flag
permissions.enable_flag("new_ui")

-- Disable a feature flag
permissions.disable_flag("old_feature")

-- Check if flag is enabled
if permissions.is_flag_enabled("beta_mode") then
  print("Beta mode active")
end

-- Check multiple required flags
local allEnabled, missing = permissions.check_required_flags({
  "flag1",
  "flag2",
  "flag3"
})

if not allEnabled then
  print("Missing flags: " .. table.concat(missing, ", "))
end
```

### Database Toggle

```lua
local permissions = require("permissions")

-- Enable database
permissions.enable_database()

-- Disable database
permissions.disable_database()

-- Check database status
if permissions.is_database_enabled() then
  print("Database is available")
end

-- Require database (throws error if disabled)
permissions.require_database("my feature")

-- Get detailed status
local status = permissions.get_database_status()
print(status.message)
```

### Level Enforcement

```lua
local permissions = require("permissions")

-- Enforce minimum level (throws error if not met)
local userLevel = 2
local minLevel = 4

-- This will throw an error
permissions.enforce_level(userLevel, minLevel, "admin panel")
-- Error: "Access denied to admin panel: requires level 4, user has level 2"
```

## Real-World Examples

### Example 1: Audit Log Package

The audit log package requires moderator access and database connectivity:

```json
{
  "packageId": "audit_log",
  "permissions": {
    "enabled": true,
    "minLevel": 3,
    "databaseRequired": true,
    "components": {
      "AuditLogViewer": {
        "enabled": true,
        "minLevel": 3,
        "requireDatabase": true
      },
      "LogTable": {
        "enabled": true,
        "minLevel": 4,
        "requireDatabase": true
      }
    }
  }
}
```

**Access control:**
- Package: Requires level 3 (Moderator) and database
- AuditLogViewer: Level 3 users can view
- LogTable: Only level 4+ (Admin) can access detailed table

### Example 2: DBAL Demo with Feature Flags

The DBAL demo uses feature flags for progressive rollout:

```json
{
  "packageId": "dbal_demo",
  "permissions": {
    "enabled": true,
    "minLevel": 3,
    "databaseRequired": true,
    "components": {
      "KVStorePanel": {
        "enabled": true,
        "minLevel": 3,
        "requireDatabase": true,
        "featureFlags": ["kv_store_enabled"]
      },
      "BlobStoragePanel": {
        "enabled": true,
        "minLevel": 4,
        "requireDatabase": true,
        "featureFlags": ["blob_storage_enabled"]
      }
    }
  }
}
```

**Access control:**
- KVStorePanel: Level 3+ with kv_store_enabled flag
- BlobStoragePanel: Level 4+ with blob_storage_enabled flag
- Both require database connectivity

### Example 3: Public Content Package

A public package with no authentication required:

```json
{
  "packageId": "ui_footer",
  "permissions": {
    "enabled": true,
    "minLevel": 0
  }
}
```

**Access control:**
- Anyone can access (no authentication needed)
- No database requirement
- No feature flags

## Permission Check Flow

When checking access, the system evaluates in this order:

1. **Enabled Check**: Is the resource enabled?
2. **Level Check**: Does user have sufficient permission level?
3. **Database Check**: Is database available if required?
4. **Feature Flag Check**: Are all required flags enabled?

The first failed check stops evaluation and returns the denial reason.

## Best Practices

### 1. Start Permissive, Then Restrict

Begin with broad access and add restrictions as needed:

```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 1
  }
}
```

### 2. Use Component-Level Permissions

Different components can have different requirements:

```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 2,
    "components": {
      "ViewerComponent": {
        "enabled": true,
        "minLevel": 2
      },
      "EditorComponent": {
        "enabled": true,
        "minLevel": 4
      }
    }
  }
}
```

### 3. Handle Database Gracefully

Mark database requirements clearly:

```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 2,
    "databaseRequired": true,
    "components": {
      "DataGrid": {
        "enabled": true,
        "minLevel": 2,
        "requireDatabase": true
      },
      "StaticHelp": {
        "enabled": true,
        "minLevel": 1
      }
    }
  }
}
```

### 4. Use Feature Flags for Rollout

Gradually enable features with flags:

```json
{
  "components": {
    "LegacyUI": {
      "enabled": true,
      "minLevel": 2
    },
    "NewUI": {
      "enabled": true,
      "minLevel": 2,
      "featureFlags": ["new_ui_beta"]
    }
  }
}
```

### 5. Document Permission Requirements

Add clear descriptions:

```json
{
  "packageId": "admin_tools",
  "description": "Admin tools (requires level 4+ and database)",
  "permissions": {
    "enabled": true,
    "minLevel": 4,
    "databaseRequired": true
  }
}
```

## Testing Permissions

### Unit Tests

Test individual permission functions:

```lua
describe("Permission Tests", function()
  it("should allow access when requirements are met", function()
    local result = permissions.check_access(4, {
      enabled = true,
      minLevel = 3
    })
    assert.is_true(result.allowed)
  end)
end)
```

### Integration Tests

Test complete workflows:

```lua
describe("Package Access", function()
  before_each(function()
    permissions.initialize_flags({beta = true})
    permissions.enable_database()
  end)

  it("should check full package access", function()
    local result = permissions.check_package_access(4, packageConfig)
    assert.is_true(result.allowed)
  end)
end)
```

## API Reference

### Core Functions

#### `check_access(userLevel, permissions, featureFlags?, databaseEnabled?)`
Check if user has permission to access a resource.

**Parameters:**
- `userLevel`: User's permission level (0-6)
- `permissions`: Permission configuration object
- `featureFlags`: Optional feature flag state
- `databaseEnabled`: Optional database availability

**Returns:** `PermissionCheckResult`

#### `check_package_access(userLevel, packagePermissions)`
Check package access with current system state.

**Parameters:**
- `userLevel`: User's permission level
- `packagePermissions`: Package permission configuration

**Returns:** `PermissionCheckResult`

#### `check_component_access(userLevel, componentPermissions)`
Check component access with current system state.

**Parameters:**
- `userLevel`: User's permission level
- `componentPermissions`: Component permission configuration

**Returns:** `PermissionCheckResult`

### Feature Flag Functions

#### `initialize_flags(flags)`
Initialize feature flag state.

#### `enable_flag(flagName)`
Enable a feature flag.

#### `disable_flag(flagName)`
Disable a feature flag.

#### `is_flag_enabled(flagName)`
Check if flag is enabled.

#### `get_all_flags()`
Get all feature flags (returns copy).

#### `check_required_flags(requiredFlags)`
Check if all required flags are enabled.

### Database Functions

#### `initialize_database(enabled?)`
Initialize database state.

#### `enable_database()`
Enable database access.

#### `disable_database()`
Disable database access.

#### `is_database_enabled()`
Check if database is enabled.

#### `require_database(resourceName?)`
Enforce database requirement (throws if disabled).

#### `get_database_status()`
Get database status with metadata.

### Level Enforcement

#### `enforce_level(userLevel, minLevel, resourceName?)`
Enforce minimum level requirement (throws if not met).

## Troubleshooting

### Access Denied - Insufficient Level

**Error:** "Insufficient permission level"

**Solution:** User's level is too low. Check:
1. User's actual permission level
2. Required `minLevel` in configuration
3. Whether inheritance should apply

### Database Required But Disabled

**Error:** "Database is required but not enabled"

**Solution:** Database is disabled but resource needs it. Either:
1. Enable database: `permissions.enable_database()`
2. Remove database requirement from resource
3. Provide alternative non-database component

### Feature Flag Not Enabled

**Error:** "Required feature flag 'x' is not enabled"

**Solution:** Required flag is missing or disabled. Either:
1. Enable the flag: `permissions.enable_flag('x')`
2. Remove flag requirement from component
3. Check flag name spelling

## Migration Guide

### Adding Permissions to Existing Package

1. Add permissions field to metadata.json
2. Set package-level defaults
3. Configure component permissions
4. Test with different user levels
5. Update documentation

### Removing Permission Requirements

To make a restricted package public:

```json
{
  "permissions": {
    "enabled": true,
    "minLevel": 0
  }
}
```

To disable a component temporarily:

```json
{
  "components": {
    "MyComponent": {
      "enabled": false,
      "minLevel": 2
    }
  }
}
```

## See Also

- Package Metadata Schema
- User Authentication Guide
- Database Configuration
- Feature Flag Management
