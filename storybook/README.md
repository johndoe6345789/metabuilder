# MetaBuilder Lua Package Storybook

A standalone Storybook for previewing Lua packages from MetaBuilder without running the full application.

## Quick Start

```bash
cd storybook
npm install
npm run dev
```

Then open http://localhost:6006

## Structure

```
storybook/
├── .storybook/           # Storybook configuration
│   ├── main.ts           # Main config (addons, static dirs)
│   └── preview.tsx       # Preview decorators and globals
├── src/
│   ├── components/       # React components for rendering
│   │   ├── registry.tsx  # Component registry (Lua type → React)
│   │   └── LuaPackageRenderer.tsx
│   ├── mocks/
│   │   ├── lua-engine.ts # Mock Lua execution
│   │   └── packages/     # Pre-rendered package outputs
│   │       ├── dashboard.ts
│   │       ├── ui-level4.ts
│   │       └── user-manager.ts
│   ├── stories/          # Storybook stories
│   │   ├── Introduction.mdx
│   │   ├── Components.stories.tsx
│   │   └── LuaPackages.stories.tsx
│   ├── styles/
│   │   └── globals.scss  # Global styles
│   └── types/
│       └── lua-types.ts  # TypeScript types
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
