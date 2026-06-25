# JSON Storybook Story Loader

**No code generation - stories are loaded and rendered directly from JSON at runtime.**

This is the true meta/abstract approach: the JSON itself defines renderable stories, not templates for code generation.

## Philosophy

Instead of generating `.stories.tsx` files from JSON, we **directly load and render** the JSON story definitions. This keeps stories as pure data that's interpreted at runtime, staying true to the 95% configuration rule.

## How It Works

1. **Discovery**: Scans `packages/*/storybook/stories.json` files
2. **Loading**: Reads JSON story definitions at runtime
3. **Rendering**: Renders components directly from JSON via `DynamicStory` component
4. **No Intermediate**: No code generation step - JSON → Render

## Usage

### Load Stories from JSON

```typescript
import { loadAllStoryDefinitions } from './json-loader/storybook-json-loader'
import { DynamicStory } from './json-loader/DynamicStory'

// Load all story definitions
const storyDefs = await loadAllStoryDefinitions(packagesDir)

// Get a specific package's stories
const uiHomeStories = storyDefs.get('ui_home')

// Render a story
<DynamicStory 
  packageName="ui_home"
  storyDef={uiHomeStories}
  story={uiHomeStories.stories[0]}
  packagesDir={packagesDir}
/>
```

### Example: JSON Story Definition

`packages/ui_home/storybook/stories.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-storybook.schema.json",
  "title": "Home Page Components",
  "category": "UI",
  "description": "Landing page components",
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
        "title": "Build Anything, Visually",
        "subtitle": "A 6-level meta-architecture"
      }
    }
  ],
  "parameters": {
    "layout": "fullscreen"
  }
}
```

**Rendered directly - no intermediate code generation!**

## How Stories Are Rendered

1. `DynamicStory` component receives story definition
2. Loads package components from `packages/{name}/components/ui.json`
3. Finds component by `story.render` (matches component id or name)
4. Passes `story.args` as props to `JSONComponentRenderer`
5. Component renders from JSON definition

## Story Features

- **Args**: Pass props to components via `story.args`
- **Parameters**: Configure Storybook display via `parameters`
- **ArgTypes**: Define controls via `argTypes`
- **Context Variants**: Multiple rendering contexts via `contextVariants`
- **Default Context**: Shared context via `defaultContext`

## Benefits of JSON Loading

1. **True Meta Architecture**: Stories are data, not code
2. **No Build Step**: JSON is directly loaded
3. **Runtime Loading**: Changes take effect immediately
4. **Single Source of Truth**: JSON is the only definition
5. **Package Ownership**: Each package owns its story data
6. **Schema Validated**: Stories conform to JSON schema

## File Structure

```
storybook/
├── json-loader/
│   ├── storybook-json-loader.ts     # JSON story loader
│   └── DynamicStory.tsx             # Story renderer component
└── .storybook/                      # Storybook config
```

## Integration with Storybook

Create a `.stories.tsx` file that uses the JSON loader:

```typescript
// ui_home.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { loadStoryDefinition } from '../json-loader/storybook-json-loader'
import { DynamicStory } from '../json-loader/DynamicStory'

const storyDef = await loadStoryDefinition('ui_home', packagesDir)

const meta: Meta = {
  title: storyDef.title,
  parameters: storyDef.parameters,
}

export default meta

// Each story is rendered from JSON
export const HomePage: StoryObj = {
  render: () => <DynamicStory 
    packageName="ui_home"
    storyDef={storyDef}
    story={storyDef.stories[0]}
    packagesDir={packagesDir}
  />
}
```

Or create a single loader file that auto-discovers all packages:

```typescript
// all-packages.stories.tsx
import { loadAllStoryDefinitions } from '../json-loader/storybook-json-loader'

const allStories = await loadAllStoryDefinitions(packagesDir)

// Generate stories for each package dynamically
for (const [packageName, storyDef] of allStories) {
  // Register stories...
}
```

## vs Code Generation

| Approach | Source of Truth | Runtime | Changes |
|----------|----------------|---------|---------|
| **Code Generation** | JSON → Generate `.stories.tsx` | Renders React | Requires regeneration |
| **JSON Loading** ✅ | JSON (only) | Loads & renders JSON | Immediate effect |

JSON loading is more meta/abstract - the configuration itself is renderable!

## See Also

- `schemas/package-schemas/storybook_schema.json` - JSON Schema
- `packages/*/storybook/stories.json` - Story definitions
- `frontends/nextjs/src/components/JSONComponentRenderer.tsx` - Component renderer
