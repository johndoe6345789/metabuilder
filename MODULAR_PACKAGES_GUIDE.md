# Modular Package Architecture - Complete Guide

## Overview

The MetaBuilder platform now uses a **modular package system** where each component lives in its own isolated folder with:
- **Seed data** (components.json, scripts.lua, metadata.json)
- **Static content** (examples, assets, documentation)

This architecture allows packages to be **dropped in**, **glued together**, and **used immediately** without modifying core TypeScript code.

## 📁 Package Structure

```
/packages/
├── admin_dialog/
│   ├── seed/
│   │   ├── components.json      # Component hierarchy
│   │   ├── metadata.json         # Package info & exports
│   │   ├── scripts.lua           # Legacy single file (optional)
│   │   └── scripts/              # NEW: Organized Lua scripts
│   │       ├── manifest.json     # Script file registry
│   │       ├── init.lua          # Initialization
│   │       ├── handlers.lua      # Event handlers
│   │       ├── validators.lua    # Validation logic
│   │       └── utils.lua         # Helper functions
│   ├── static_content/
│   │   ├── examples.json         # Usage examples
│   │   └── assets/               # Images, icons
│   └── README.md                 # Documentation
├── data_table/
├── form_builder/
├── nav_menu/
├── dashboard/
├── notification_center/
└── manifest.json                 # Registry of all packages
```

**NEW**: Packages now support multiple organized Lua scripts in a `scripts/` subfolder.
See [PACKAGE_SCRIPTS_GUIDE.md](./PACKAGE_SCRIPTS_GUIDE.md) for details.

## 🎯 Core Concept: Drop & Glue

### 1. **Drop** - Add a Package

Create a new folder in `/packages/` with the standard structure:

```bash
/packages/my_feature/
  ├── seed/
  │   ├── components.json
  │   ├── scripts.lua
  │   └── metadata.json
  └── static_content/
      └── examples.json
```

### 2. **Glue** - Register the Package

Add to `/src/lib/package-glue.ts`:

```typescript
import myFeatureComponents from '../../packages/my_feature/seed/components.json'
import myFeatureMetadata from '../../packages/my_feature/seed/metadata.json'

// In buildPackageRegistry():
const myFeatureScripts = await loadLuaScript('my_feature')
registry['my_feature'] = {
  ...myFeatureMetadata,
  components: myFeatureComponents,
  scripts: myFeatureScripts,
  examples: {}
}
```

### 3. **Use** - Instant Availability

The package is now available system-wide:
- Components can be placed on pages
- Lua scripts execute business logic
- No TypeScript compilation needed

## 📦 Available Packages

### UI Components

| Package | Purpose | Key Features |
|---------|---------|--------------|
| **admin_dialog** | Reusable admin dialogs | Dynamic forms, validation, state management |
| **data_table** | Advanced data tables | Search, sort, filter, CRUD, row selection |
| **form_builder** | Dynamic form builder | 15+ field types, validation, error handling |
| **nav_menu** | Navigation menus | Role-based links, user section, mobile responsive |
| **notification_center** | Notifications | Real-time alerts, filtering, mark as read |

### Page Templates

| Package | Purpose | Key Features |
|---------|---------|--------------|
| **dashboard** | Dashboard layouts | Stats cards, widgets, customizable layout |

## 🔧 Package Anatomy

### components.json

Defines the component hierarchy using declarative JSON:

```json
[
  {
    "id": "my_component_root",
    "type": "Card",
    "props": {
      "className": "p-4"
    },
    "children": ["my_component_header", "my_component_body"]
  },
  {
    "id": "my_component_header",
    "type": "h2",
    "props": {},
    "content": "{{state.title}}"
  }
]
```

**Key Features:**
- Hierarchical component tree
- Props binding to state: `"{{state.fieldName}}"`
- Event handlers: `"{{handlers.handleClick}}"`
- shadcn components: Dialog, Card, Button, etc.

### scripts.lua

Contains all business logic in Lua:

```lua
-- Initialize state
function my_package_init(config)
  return {
    title = config.title or "Default",
    data = {},
    isLoading = false
  }
end

-- Handle actions
function my_package_handle_action(state, action)
  local newState = table_clone(state)
  newState.isLoading = true
  -- ... logic here
  return newState
end

-- Utility functions
function table_clone(orig)
  local copy = {}
  for k, v in pairs(orig) do
    if type(v) == 'table' then
      copy[k] = table_clone(v)
    else
      copy[k] = v
    end
  end
  return copy
end
```

**Lua Features:**
- Stateless, pure functions
- Immutable state updates
- Full Lua standard library
- Custom helper functions

### metadata.json

Package manifest and exports:

```json
{
  "packageId": "my_package",
  "name": "My Package",
  "version": "1.0.0",
  "description": "Package description",
  "author": "MetaBuilder System",
  "category": "ui-component",
  "dependencies": [],
  "exports": {
    "components": ["my_component_root"],
    "scripts": [
      "my_package_init",
      "my_package_handle_action"
    ]
  },
  "shadowcnComponents": ["Card", "Button"]
}
```

## 🎨 Package Categories

- **ui-component**: Reusable UI components
- **page-template**: Full page layouts
- **feature**: Complete features (forum, chat, etc.)
- **utility**: Helper functions
- **integration**: Third-party services

## 🚀 Usage Flow

### 1. System Initialization

```typescript
// On app startup
await initializePackageSystem()
```

This:
1. Loads all packages from `/packages/`
2. Builds package registry
3. Stores components and scripts in KV store
4. Makes everything available system-wide

### 2. Using Components in Pages

In Level 4/5 builder, select from package components:

```json
{
  "pageId": "admin_page",
  "components": [
    "admin_dialog_root",
    "data_table_root"
  ]
}
```

### 3. Lua Scripts Execute Automatically

When a component renders:
1. Initialize: `my_package_init()` called
2. User interaction triggers handler
3. Handler calls Lua function
4. Lua returns new state
5. Component re-renders

## 💡 Example: Creating a Comment Box Package

### Step 1: Create Structure

```bash
mkdir -p packages/comment_box/seed
mkdir -p packages/comment_box/static_content
```

### Step 2: components.json

```json
[
  {
    "id": "comment_box_root",
    "type": "Card",
    "props": { "className": "space-y-4 p-4" },
    "children": ["comment_box_list", "comment_box_form"]
  },
  {
    "id": "comment_box_list",
    "type": "CommentList",
    "props": {
      "comments": "{{state.comments}}",
      "onDelete": "{{handlers.handleDelete}}"
    }
  },
  {
    "id": "comment_box_form",
    "type": "Textarea",
    "props": {
      "value": "{{state.newComment}}",
      "onChange": "{{handlers.handleChange}}",
      "placeholder": "Write a comment..."
    }
  }
]
```

### Step 3: scripts.lua

```lua
function comment_box_init(config)
  return {
    comments = config.initialComments or {},
    newComment = "",
    isSubmitting = false
  }
end

function comment_box_handle_change(state, value)
  local newState = table_clone(state)
  newState.newComment = value
  return newState
end

function comment_box_add_comment(state, authorId)
  if state.newComment == "" then
    return state
  end
  
  local newState = table_clone(state)
  local comment = {
    id = "comment_" .. os.time(),
    text = newState.newComment,
    authorId = authorId,
    timestamp = os.time()
  }
  table.insert(newState.comments, comment)
  newState.newComment = ""
  return newState
end

function table_clone(orig)
  local copy = {}
  for k, v in pairs(orig) do
    if type(v) == 'table' then
      copy[k] = table_clone(v)
    else
      copy[k] = v
    end
  end
  return copy
end
```

### Step 4: metadata.json

```json
{
  "packageId": "comment_box",
  "name": "Comment Box",
  "version": "1.0.0",
  "description": "Simple comment system with add/delete",
  "author": "MetaBuilder System",
  "category": "ui-component",
  "dependencies": [],
  "exports": {
    "components": ["comment_box_root"],
    "scripts": [
      "comment_box_init",
      "comment_box_handle_change",
      "comment_box_add_comment"
    ]
  }
}
```

### Step 5: Register in package-glue.ts

```typescript
import commentBoxComponents from '../../packages/comment_box/seed/components.json'
import commentBoxMetadata from '../../packages/comment_box/seed/metadata.json'

// In buildPackageRegistry():
const commentBoxScripts = await loadLuaScript('comment_box')
registry['comment_box'] = {
  ...commentBoxMetadata,
  components: commentBoxComponents,
  scripts: commentBoxScripts,
  examples: {}
}
```

### Step 6: Use It!

Now `comment_box_root` can be placed on any page in the Level 4/5 builder!

## 🔥 Benefits

✅ **No TypeScript needed** - Everything in JSON and Lua  
✅ **True modularity** - Each package is independent  
✅ **Easy distribution** - Share packages as folders  
✅ **Rapid development** - Drop in, glue, done  
✅ **Type safety** - JSON validated at load time  
✅ **Version control friendly** - Clear folder structure  
✅ **Scalable** - Hundreds of packages, zero impact  

## 📚 Advanced Topics

### Package Dependencies

```json
{
  "packageId": "advanced_table",
  "dependencies": ["data_table", "form_builder"]
}
```

System automatically checks dependencies before loading.

### Package Versioning

```json
{
  "version": "2.1.0",
  "minSystemVersion": "1.0.0"
}
```

### Import/Export Packages

Packages can be exported as ZIP files for distribution:

```typescript
import { exportPackageAsZip } from '@/lib/package-import-export'
await exportPackageAsZip('admin_dialog')
```

### Custom shadcn Components

Specify which shadcn components the package uses:

```json
{
  "shadowcnComponents": [
    "Dialog",
    "Card",
    "Button",
    "Input"
  ]
}
```

## 🎓 Best Practices

1. **One responsibility per package** - Keep packages focused
2. **Immutable Lua functions** - Always return new state
3. **Clear naming** - Use descriptive IDs: `package_component_element`
4. **Document examples** - Include examples.json
5. **Test independently** - Each package should work standalone

## 🔮 Future Roadmap

- [ ] Package marketplace
- [ ] Hot-reload in development
- [ ] Automated testing framework
- [ ] Package CLI tools
- [ ] Dependency version constraints
- [ ] Package analytics

---

**The modular package system is now live!** Drop in new packages, glue them together, and build applications faster than ever.
