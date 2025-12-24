# Package Scripts Organization Guide

## Overview

Packages can now organize Lua scripts in two ways:
1. **Legacy Single File**: A single `scripts.lua` file (backward compatible)
2. **Multi-File Structure**: Multiple organized Lua files in a `scripts/` subfolder (NEW)

Both formats are supported simultaneously. The system will load both if present.

---

## Multi-File Script Structure

### Folder Layout

```
packages/
└── your_package/
    └── seed/
        ├── components.json
        ├── metadata.json
        ├── scripts.lua          (optional - legacy support)
        └── scripts/             (NEW - organized scripts)
            ├── manifest.json
            ├── init.lua
            ├── handlers.lua
            ├── validators.lua
            ├── utils.lua
            └── [more files...]
```

---

## Script Manifest

The `scripts/manifest.json` file lists all Lua script files in the folder:

```json
{
  "scripts": [
    {
      "file": "init.lua",
      "name": "Initialization",
      "category": "core",
      "description": "Initialize component state and configuration"
    },
    {
      "file": "handlers.lua",
      "name": "Event Handlers",
      "category": "handlers",
      "description": "Handle user interactions and events"
    },
    {
      "file": "validators.lua",
      "name": "Form Validators",
      "category": "validation",
      "description": "Validate form data and display errors"
    },
    {
      "file": "utils.lua",
      "name": "Utilities",
      "category": "utils",
      "description": "Helper functions and utilities"
    }
  ]
}
```

### Manifest Fields

- **file**: Filename of the Lua script (required)
- **name**: Human-readable name (optional, defaults to filename)
- **category**: Category for organization (optional)
- **description**: Brief description of the script's purpose (optional)

---

## Auto-Discovery (Fallback)

If no `manifest.json` exists, the system will automatically try to load common script filenames:

- `init.lua` - Initialization logic
- `handlers.lua` - Event handlers
- `validators.lua` - Validation functions
- `utils.lua` - Utility functions
- `state.lua` - State management
- `actions.lua` - Action functions

This allows quick prototyping without creating a manifest file.

---

## Recommended Script Organization

### 1. `init.lua` - Initialization

Contains functions for initializing component state and configuration.

```lua
-- Initialize component state
function my_component_init(config)
  return {
    isOpen = config.defaultOpen or false,
    data = config.initialData or {},
    errors = {}
  }
end
```

### 2. `handlers.lua` - Event Handlers

Contains functions that respond to user interactions.

```lua
-- Handle form field changes
function my_component_handle_change(state, fieldName, value)
  local newState = table_clone(state)
  newState.data[fieldName] = value
  return newState
end

-- Handle form submission
function my_component_handle_submit(state, validationRules)
  -- Validation and submission logic
end
```

### 3. `validators.lua` - Validation Logic

Contains validation functions for forms and data.

```lua
-- Validate form data
function my_component_validate(state, rules)
  local errors = {}
  -- Validation logic here
  return errors
end

-- Validate specific field types
function validate_email(email)
  -- Email validation logic
end

function validate_password(password, minLength)
  -- Password validation logic
end
```

### 4. `utils.lua` - Utility Functions

Contains reusable helper functions.

```lua
-- Deep clone a table
function table_clone(orig)
  -- Clone logic
end

-- Merge two tables
function table_merge(t1, t2)
  -- Merge logic
end

-- String utilities
function string_trim(str)
  -- Trim logic
end
```

### 5. `state.lua` - State Management (optional)

Contains state management logic for complex components.

```lua
-- Create initial state
function create_initial_state()
  return {}
end

-- State reducers
function state_reducer(state, action)
  -- Reducer logic
end
```

### 6. `actions.lua` - Action Creators (optional)

Contains action creator functions for workflow integration.

```lua
-- Create action objects
function create_action(type, payload)
  return {
    type = type,
    payload = payload
  }
end
```

---

## Benefits of Multi-File Structure

### 1. **Better Organization**
- Separate concerns (initialization, validation, handlers)
- Easier to find specific functionality
- Cleaner file structure

### 2. **Improved Maintainability**
- Each file has a single responsibility
- Easier to update and debug
- Better version control diffs

### 3. **Team Collaboration**
- Multiple developers can work on different scripts
- Less merge conflicts
- Clear ownership of functionality

### 4. **Reusability**
- Share utility scripts across packages
- Import common validators
- Build script libraries

### 5. **Better Documentation**
- Manifest provides script metadata
- Each file can have focused comments
- Category-based organization

---

## Database Storage

Scripts from multi-file packages are stored individually in the database:

```javascript
// Legacy single file
{
  id: "package_admin_dialog",
  name: "Admin Dialog Scripts",
  code: "...",
  category: "package",
  packageId: "admin_dialog"
}

// New multi-file format
{
  id: "package_admin_dialog_init",
  name: "Admin Dialog - Initialization",
  code: "...",
  category: "core",
  packageId: "admin_dialog",
  path: "scripts/init.lua",
  description: "Initialize admin dialog state"
}
```

---

## Migration Guide

### Converting Single File to Multi-File

1. **Create scripts folder**:
   ```bash
   mkdir packages/your_package/seed/scripts
   ```

2. **Split your scripts.lua** into logical files:
   - Functions for initialization → `init.lua`
   - Event handlers → `handlers.lua`
   - Validators → `validators.lua`
   - Utilities → `utils.lua`

3. **Create manifest.json**:
   ```json
   {
     "scripts": [
       {"file": "init.lua", "name": "Initialization", "category": "core"},
       {"file": "handlers.lua", "name": "Event Handlers", "category": "handlers"}
     ]
   }
   ```

4. **Keep scripts.lua for backward compatibility** (optional)

---

## Example Package: Admin Dialog

The admin_dialog package demonstrates the multi-file structure:

```
packages/admin_dialog/seed/
├── scripts.lua                    (legacy - still works)
└── scripts/
    ├── manifest.json
    ├── init.lua                   (initialization)
    ├── handlers.lua               (event handlers)
    ├── validators.lua             (validation)
    └── utils.lua                  (utilities)
```

### init.lua
- `admin_dialog_init()` - Create initial state
- `admin_dialog_open()` - Open dialog
- `admin_dialog_close()` - Close dialog

### handlers.lua
- `admin_dialog_handle_change()` - Handle field changes
- `admin_dialog_handle_submit()` - Handle form submission
- `admin_dialog_handle_cancel()` - Handle cancellation

### validators.lua
- `admin_dialog_validate()` - Validate form data
- `validate_email()` - Email validation
- `validate_password()` - Password validation

### utils.lua
- `table_clone()` - Deep clone tables
- `table_merge()` - Merge tables
- `string_trim()` - Trim strings
- Various helper functions

---

## Best Practices

1. **Keep files focused**: Each file should have a single purpose
2. **Use descriptive names**: File names should clearly indicate their purpose
3. **Document functions**: Add comments explaining what each function does
4. **Follow naming conventions**: Use consistent prefixes like `component_action_name`
5. **Avoid circular dependencies**: Structure code to minimize cross-file dependencies
6. **Test individually**: Each script should be testable on its own
7. **Use categories**: Group related scripts with category tags

---

## API Reference

### Loading Scripts (automatic)

Scripts are loaded automatically during package initialization:

```typescript
// In package-glue.ts
const scriptFiles = await loadLuaScriptsFolder('package_id')
// Returns: LuaScriptFile[]
```

### Accessing Scripts

```typescript
import { getPackageScriptFiles, getAllPackageScripts } from '@/lib/package-glue'

// Get individual script files
const scriptFiles = getPackageScriptFiles(packageDef)

// Get all scripts (legacy + new)
const allScripts = getAllPackageScripts(packageDef)
```

### LuaScriptFile Interface

```typescript
interface LuaScriptFile {
  name: string          // Script name
  path: string          // Relative path
  code: string          // Lua code
  category?: string     // Optional category
  description?: string  // Optional description
}
```

---

## Future Enhancements

- **Hot reloading**: Reload scripts without restarting
- **Script dependencies**: Declare dependencies between scripts
- **Script versioning**: Track script versions separately
- **Script testing**: Built-in testing framework for Lua scripts
- **Script marketplace**: Share individual scripts across packages
- **Script analytics**: Track which scripts are most used

---

## Support

For questions or issues with the multi-script system, refer to:
- [Lua Integration Guide](../LUA_INTEGRATION.md)
- [Package System Documentation](../PACKAGE_SYSTEM.md)
- [Modular Packages Guide](../MODULAR_PACKAGES_GUIDE.md)
