# MetaBuilder Package Storybook

A standalone Storybook for previewing MetaBuilder packages powered by JSON scripts without running the full application.

## Quick Start

```bash
cd storybook
npm install
npm run dev
```

Then open http://localhost:6006

## Features

### 🔍 Auto-Discovery
Packages are automatically discovered from `packages/index.json` based on `storybook.config.json`:

```json
{
    "discovery": {
      "includedCategories": ["ui", "admin", "gaming", "social", "editors"],
      "excludedPackages": ["shared", "testing"],
      "minLevel": 1,
      "maxLevel": 6
    }
}
```

### 🎭 Context Variants
Test packages with different user contexts:
- **Guest** - Level 1 user
- **Admin** - Level 4 user  
- **Admin (Nerd Mode)** - Level 4 with nerdMode enabled
- **Supergod** - Level 6 user

### 🔧 Interactive Explorer
Use **Auto-Discovered Packages → Explorer** to:
- Browse all discovered packages
- Select scripts to render
- Switch context variants
- Toggle debug mode

## Structure

```
storybook/
├── .storybook/              # Storybook configuration
│   ├── main.ts              # Main config (addons, static dirs)
│   └── preview.tsx          # Preview decorators and globals
├── storybook.config.json    # ⭐ Auto-discovery configuration
├── src/
│   ├── components/          # React components for rendering
│   │   ├── registry.tsx     # Component registry (Lua type → React)
│   │   └── LuaPackageRenderer.tsx
│   ├── discovery/           # ⭐ Auto-discovery system
│   │   └── package-discovery.ts  # Reads packages/index.json
│   ├── lua/                 # ⭐ Real Lua execution
│   │   └── executor.ts      # Fengari-based Lua runner
│   ├── mocks/
│   │   ├── lua-engine.ts    # Mock Lua execution (fallback)
│   │   └── packages/        # Pre-rendered package outputs
│   ├── stories/
│   │   ├── Introduction.mdx
│   │   ├── AutoDiscovered.stories.tsx  # ⭐ Interactive explorer
│   │   ├── Components.stories.tsx
│   │   └── LuaPackages.stories.tsx
│   ├── styles/
│   │   └── globals.scss
│   └── types/
│       └── lua-types.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How It Works

### 1. Lua Packages Output Structure

Lua packages return component trees like:

```lua
return {
  type = "Card",
  props = { className = "p-4" },
  children = {
    { type = "Typography", props = { variant = "h5", text = "Title" } }
  }
}
```

### 2. Mock Package Data

Since Storybook runs in the browser without a Lua VM, we create mock data that mirrors the Lua output:

```typescript
// src/mocks/packages/dashboard.ts
const dashboardPackage: MockPackageDefinition = {
  metadata: { packageId: 'dashboard', name: 'Dashboard', ... },
  renders: {
    'stats.card': (ctx) => ({
      type: 'Card',
      children: [...]
    })
  }
}
registerMockPackage(dashboardPackage)
```

### 3. Component Registry

Maps Lua type names to React components:

```typescript
// src/components/registry.tsx
export const componentRegistry = {
  Box, Stack, Flex, Grid, Container,
  Card, CardHeader, CardContent,
  Typography, Button, Icon,
  // ... more components
}
```

### 4. LuaPackageRenderer

Recursively renders the component tree:

```tsx
<LuaPackageRenderer
  component={luaOutputTree}
  debug={false}
/>
```

## Adding a New Package Mock

1. Create `src/mocks/packages/{package-name}.ts`:

```typescript
import { registerMockPackage, type MockPackageDefinition } from '../lua-engine'

const myPackage: MockPackageDefinition = {
  metadata: {
    packageId: 'my_package',
    name: 'My Package',
    version: '1.0.0',
    description: 'Description',
    category: 'ui',
    minLevel: 2,
  },
  renders: {
    'main.render': (ctx) => ({
      type: 'Box',
      children: [/* ... */]
    })
  }
}

registerMockPackage(myPackage)
export default myPackage
```

2. Import in `src/mocks/packages/index.ts`:

```typescript
import './my-package'
```

3. Create stories in `src/stories/`:

```typescript
export const MyPackageMain: Story = createPackageStory('my_package', 'main.render')
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Storybook dev server on port 6006 |
| `npm run build` | Build static Storybook for deployment |
| `npm run preview` | Preview built Storybook |

## Available Components

### Layout
- `Box`, `Stack`, `Flex`, `Grid`, `Container`

### Surfaces
- `Card`, `CardHeader`, `CardContent`, `CardActions`, `Paper`

### Typography
- `Typography` (variants: h1-h6, body1, body2, caption, overline)

### Inputs
- `Button` (variants: contained, outlined, text; sizes: small, medium, large)

### Display
- `Icon`, `Avatar`, `Badge`, `Chip`, `Divider`, `Alert`

### Navigation
- `Tabs`, `Tab`

### App-Specific
- `Level4Header`, `IntroSection`, `AppHeader`, `AppFooter`, `Sidebar`

## Adding New Components

1. Add to `src/components/registry.tsx`:

```typescript
export const MyComponent: React.FC<LuaComponentProps> = ({ className, children }) => (
  <div className={className}>{children}</div>
)

// Add to registry
export const componentRegistry = {
  // ...existing
  MyComponent,
}
```

2. The component will automatically be available in Lua packages via `type = "MyComponent"`.
