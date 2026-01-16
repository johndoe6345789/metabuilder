# Storybook Story Generators

This folder contains tools for generating Storybook stories from declarative JSON definitions in packages.

## Structure

```
storybook/
├── generators/
│   ├── storybook-generator.ts     # Core generator logic
│   └── generate.ts                # CLI script
├── generated/                     # Generated .stories.tsx files (gitignored)
└── .storybook/                    # Storybook configuration
```

## Usage

### Generate All Package Stories

```bash
# From project root
npm run storybook:generate

# Or with watch mode
npm run storybook:generate:watch
```

### Generate Specific Package Stories

```bash
npm run storybook:generate ui_home
```

### Run Storybook

```bash
cd storybook
npm run storybook
```

## How It Works

1. **Discovery**: Scans `packages/*/storybook/stories.json` files
2. **Parsing**: Reads JSON story definitions
3. **Generation**: Converts to TypeScript `.stories.tsx` files
4. **Output**: Writes to `storybook/generated/`

## Package Story Definitions

Packages define stories in `storybook/stories.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-storybook.schema.json",
  "title": "Home Page Components",
  "stories": [
    {
      "name": "HomePage",
      "render": "home_page",
      "description": "Complete home page with all sections"
    },
    {
      "name": "HeroSection",
      "render": "hero_section",
      "args": {
        "title": "Build Anything, Visually"
      }
    }
  ]
}
```

## Generated Output Example

```typescript
/**
 * Auto-generated Storybook stories for ui_home package
 * Generated from: packages/ui_home/storybook/stories.json
 * DO NOT EDIT - This file is auto-generated
 */

import type { Meta, StoryObj } from '@storybook/react'
import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'

const pkg = await loadJSONPackage(join(packagesDir, 'ui_home'))

const meta: Meta = {
  title: 'Home Page Components',
}

export default meta
type Story = StoryObj<typeof meta>

export const HomePage: Story = {
  name: 'HomePage',
  render: () => {
    const component = pkg.components?.find(c => c.id === 'home_page')
    return <JSONComponentRenderer component={component} allComponents={pkg.components} />
  },
}
```

## Benefits

- **Data-Driven**: Stories are JSON configuration, not code
- **Package-Scoped**: Each package owns its story definitions
- **Auto-Generated**: No manual TypeScript story writing
- **Schema-Validated**: Stories conform to JSON schema
- **Meta Architecture**: Stories themselves are declarative

## See Also

- `schemas/package-schemas/storybook_schema.json` - JSON Schema
- `packages/*/storybook/` - Package story definitions
