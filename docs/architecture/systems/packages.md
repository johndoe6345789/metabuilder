# Package System Architecture

MetaBuilder's modular package system enables self-contained feature modules that can be independently developed, tested, distributed, and installed.

## Overview

The package system allows developers to:
- Create isolated feature packages
- Bundle components, data, and Lua scripts
- Import and export packages
- Share packages between installations
- Version and manage dependencies

## Package Structure

```
packages/
└── my-feature/
    ├── package.json              # Package metadata
    ├── package.md                # Package documentation
    ├── seed/
    │   ├── index.ts              # Main seed data
    │   ├── workflows.ts          # Workflow definitions
    │   ├── components.ts         # Component configurations
    │   ├── schemas.ts            # Data schemas
    │   └── scripts/
    │       ├── initialize.lua    # Lua scripts
    │       └── helpers.lua
    ├── src/
    │   ├── components/           # React components
    │   ├── lib/                  # Utilities
    │   └── hooks/                # Custom hooks
    ├── styles/
    │   └── styles.scss           # Component styles
    └── static_content/           # Assets
        ├── images/
        └── templates/
```

## Package Metadata

### package.json

```json
{
  "name": "@metabuilder/my-feature",
  "version": "1.0.0",
  "description": "Description of the feature",
  "author": "Author Name",
  "license": "MIT",
  "keywords": ["feature", "dashboard"],
  "metabuilder": {
    "type": "feature",
    "minVersion": "1.0.0",
    "permissions": ["level3"],
    "components": [
      {
        "name": "MyComponent",
        "path": "src/components/MyComponent.tsx",
        "type": "widget"
      }
    ],
    "scripts": [
      {
        "name": "setup",
        "path": "seed/scripts/initialize.lua"
      }
    ],
    "exports": {
      "./components": "./src/components/index.ts",
      "./hooks": "./src/hooks/index.ts"
    }
  }
}
```

### package.md

```markdown
# My Feature Package

Brief description of what the package provides.

## Features

- Feature 1
- Feature 2

## Installation

## Usage

## Components

### MyComponent

Description of the component and how to use it.

## Lua Scripts

### setup

Description of what the script does.
```

## Creating a Package

### Step 1: Create Directory

```bash
mkdir -p packages/my-feature/seed/scripts
mkdir -p packages/my-feature/src/{components,lib,hooks}
mkdir -p packages/my-feature/styles
mkdir -p packages/my-feature/static_content
```

### Step 2: Create package.json

```json
{
  "name": "@metabuilder/my-feature",
  "version": "1.0.0",
  "description": "My awesome feature",
  "metabuilder": {
    "type": "feature"
  }
}
```

### Step 3: Add Seed Data

```typescript
// packages/my-feature/seed/index.ts
export const packageSeed = {
  name: '@metabuilder/my-feature',
  version: '1.0.0',
  components: [
    // Component configurations
  ],
  workflows: [
    // Workflow definitions
  ],
}
```

### Step 4: Create Components

```typescript
// packages/my-feature/src/components/MyComponent.tsx
export const MyComponent = () => {
  return <div>My Feature Component</div>
}
```

### Step 5: Add Documentation

```markdown
# My Feature Package

Documentation for the package...
```

## Package Loading

### Initialization

```typescript
// In app initialization
import { initializePackageSystem } from '@/lib/package-loader'
import { packageSeed as myFeature } from '@packages/my-feature/seed'

await initializePackageSystem()
```

### Runtime Loading

```typescript
// Load package dynamically
const packageData = await importPackage('@metabuilder/my-feature')
```

## Package Dependencies

### Declaring Dependencies

```json
{
  "metabuilder": {
    "dependencies": {
      "@metabuilder/core": ">=1.0.0",
      "@metabuilder/ui": "^2.0.0"
    }
  }
}
```

### Dependency Resolution

Dependencies are resolved during package installation with version constraints:
- `*` - Any version
- `1.0.0` - Exact version
- `>=1.0.0` - Minimum version
- `^1.0.0` - Compatible with 1.x.x (caret)
- `~1.0.0` - Compatible with 1.0.x (tilde)

## Publishing Packages

### Create Distribution

```bash
# Create package distribution file
npm run package:pack my-feature

# Output: my-feature-1.0.0.zip
```

### Package Contents

The ZIP file contains:
```
my-feature-1.0.0/
├── package.json
├── package.md
├── seed/
├── src/
├── styles/
└── static_content/
```

### Share Package

- Upload to package repository
- Share via GitHub releases
- Distribute through npm
- Share directly with team

## Installing Packages

### From File

```bash
npm run package:install ./my-feature-1.0.0.zip
```

### From Repository

```bash
npm run package:install @metabuilder/my-feature@1.0.0
```

### From GitHub

```bash
npm run package:install github:username/repo#main
```

## Seed Data

Seed data allows packages to pre-populate database with configurations:

```typescript
// seed/index.ts
export const packageSeed = {
  name: '@metabuilder/my-feature',
  models: [
    {
      name: 'CustomModel',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'data', type: 'json' },
      ],
    },
  ],
  components: [
    {
      id: 'custom-widget',
      name: 'Custom Widget',
      type: 'widget',
      config: { /* ... */ },
    },
  ],
  workflows: [
    {
      id: 'my-workflow',
      name: 'My Workflow',
      steps: [ /* ... */ ],
    },
  ],
}
```

## Lua Scripts

Packages can include Lua scripts for server-side logic:

```lua
-- seed/scripts/initialize.lua
function initializePackage(context)
  -- context contains:
  -- - db: database access
  -- - user: current user
  -- - config: package configuration
  
  print("Initializing package...")
  return { success = true }
end
```

### Using Lua Scripts

```typescript
import { executeLua } from '@/lib/lua-sandbox'

const result = await executeLua(luaCode, {
  db: database,
  user: currentUser,
  config: packageConfig,
})
```

## Component Exports

Export components for use in other packages:

```typescript
// src/components/index.ts
export { MyComponent } from './MyComponent'
export { MyDialog } from './MyDialog'
export type { MyComponentProps } from './MyComponent'
```

### Importing from Packages

```typescript
// In another component
import { MyComponent } from '@metabuilder/my-feature/components'
```

## Styling

Include SCSS that integrates with the theme:

```scss
// styles/styles.scss
@import '@/styles/variables';

.my-feature {
  background-color: var(--primary-color);
  font-family: var(--font-body);
  
  .component {
    padding: var(--spacing-md);
    border-radius: var(--radius);
  }
}
```

## Asset Management

Include static assets in the package:

```
static_content/
├── images/
│   ├── logo.png
│   └── banner.jpg
├── templates/
│   └── email-template.html
└── data/
    └── initial-data.json
```

### Accessing Assets

```typescript
import logoImage from '@metabuilder/my-feature/static_content/images/logo.png'

export const Component = () => {
  return <img src={logoImage} />
}
```

## Testing Packages

### Unit Tests

```typescript
// src/components/__tests__/MyComponent.spec.tsx
import { render } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render', () => {
    const { getByText } = render(<MyComponent />)
    expect(getByText(/content/i)).toBeInTheDocument()
  })
})
```

### Run Package Tests

```bash
npm run test -- packages/my-feature
```

## Best Practices

✅ **Do:**
- Keep packages focused on single feature
- Document all exports
- Include example usage
- Version packages semantically
- Test package functionality
- Include seed data for initial setup
- Declare all dependencies
- Use consistent naming

❌ **Don't:**
- Create overly large packages
- Skip documentation
- Use hardcoded paths
- Assume specific database structure
- Mix multiple concerns in one package
- Forget version constraints
- Include secrets in packages

## Publishing to Registry

### Register Package

```bash
# Create account on registry
npm run registry:login

# Publish package
npm run package:publish
```

### Version Updates

```bash
# Increment version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Republish
npm run package:publish
```

## Multi-Tenant Packages

Ensure packages respect tenant isolation:

```typescript
// Always filter by tenant ID
const data = await prisma.customModel.findMany({
  where: {
    tenantId: context.user.tenantId,  // Tenant isolation
  },
})
```

## Examples

See `/packages/` directory for example packages:
- `dashboard/` - Dashboard widgets
- `form_builder/` - Form creation tools
- `data_table/` - Data table component
- `admin_dialog/` - Admin utilities

## Troubleshooting

### Package Not Loading

```bash
# Verify package structure
npm run package:validate my-feature

# Check permissions
npm run package:check-perms my-feature
```

### Seed Data Not Applied

```bash
# Manually run seed
npm run package:seed my-feature

# Clear and reseed
npm run db:reset && npm run seed
```

## Related Documentation

TODO: Development guide link should point to docs/guides/getting-started.md (current file does not exist).
- [Development Guide](./getting-started.md)
TODO: Component guidelines link points to a non-existent docs/components/README.md; update to correct location.
- [Component Guidelines](../components/README.md)
- [Database Architecture](./database.md)
- [5-Level System](./5-level-system.md)

See `/docs/` for comprehensive guides on package development.
