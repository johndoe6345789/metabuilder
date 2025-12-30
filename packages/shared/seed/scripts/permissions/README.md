# Permissions Module

Fine-grained access control system for MetaBuilder packages and components.

## Quick Start

```lua
local permissions = require("permissions")

-- Initialize system
permissions.initialize_flags({beta_mode = true})
permissions.enable_database()

-- Check package access
local result = permissions.check_package_access(4, {
  enabled = true,
  minLevel = 3,
  databaseRequired = true
})

if result.allowed then
  print("Access granted")
else
  print("Denied: " .. result.reason)
end
```

## Module Structure

```
permissions/
├── init.lua              # Main module facade
├── types.lua             # Type definitions
├── check_access.lua      # Access checking logic
├── enforce_level.lua     # Level enforcement
├── manage_flags.lua      # Feature flag management
├── database_toggle.lua   # Database control
└── tests/
    ├── check_access.test.lua
    ├── manage_flags.test.lua
    ├── database_toggle.test.lua
    └── integration.test.lua
```

## API

### Access Control

```lua
-- Check access with full context
permissions.check_access(userLevel, perms, flags?, dbEnabled?)

-- Check package access (uses current system state)
permissions.check_package_access(userLevel, packagePerms)

-- Check component access (uses current system state)
permissions.check_component_access(userLevel, componentPerms)

-- Enforce level (throws on failure)
permissions.enforce_level(userLevel, minLevel, resourceName?)
```

### Feature Flags

```lua
permissions.initialize_flags(flags)
permissions.enable_flag(name)
permissions.disable_flag(name)
permissions.is_flag_enabled(name)
permissions.get_all_flags()
permissions.check_required_flags(required)
```

### Database Control

```lua
permissions.initialize_database(enabled?)
permissions.enable_database()
permissions.disable_database()
permissions.is_database_enabled()
permissions.require_database(resourceName?)
permissions.get_database_status()
```

## Permission Levels

- 0, 1: PUBLIC (no auth)
- 2: USER
- 3: MODERATOR
- 4: ADMIN
- 5: GOD
- 6: SUPERGOD

## Examples

### Basic Package Check

```lua
local packagePerms = {
  enabled = true,
  minLevel = 3,
  databaseRequired = true
}

local result = permissions.check_package_access(4, packagePerms)
-- result.allowed = true (user level 4 >= required level 3)
```

### Component with Feature Flags

```lua
permissions.enable_flag("beta_ui")

local componentPerms = {
  enabled = true,
  minLevel = 2,
  featureFlags = {"beta_ui"}
}

local result = permissions.check_component_access(3, componentPerms)
-- result.allowed = true (level OK, flag enabled)
```

### Database Toggle

```lua
permissions.disable_database()

local result = permissions.check_package_access(5, {
  enabled = true,
  minLevel = 2,
  databaseRequired = true
})

-- result.allowed = false
-- result.reason = "Database is required but not enabled"
```

## Testing

Run tests with your Lua test framework:

```bash
lua test permissions/tests/check_access.test.lua
lua test permissions/tests/manage_flags.test.lua
lua test permissions/tests/database_toggle.test.lua
lua test permissions/tests/integration.test.lua
```

## Type Definitions

All types are documented with LuaCATS annotations:

- `PermissionLevel`: 0-6 integer
- `PackagePermissions`: Package permission config
- `ComponentPermission`: Component permission config
- `PermissionCheckResult`: Access check result
- `FeatureFlagState`: Flag state

See `types.lua` and `shared/scripts/types.lua` for full definitions.

## See Also

- [Full Permission System Guide](../../PERMISSIONS_GUIDE.md)
- Package metadata schema
- Renderer integration guide
