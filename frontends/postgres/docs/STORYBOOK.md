# Storybook Configuration and Usage

This project uses Storybook for component development and documentation, with configurations driven by `features.json`.

## Getting Started

### Running Storybook

```bash
npm run storybook
```

This will start Storybook on port 6006: http://localhost:6006

### Building Storybook

```bash
npm run build-storybook
```

This creates a static build in the `storybook-static` directory.

## Story Generator Utility

The project includes a story generator utility (`src/utils/storybook/storyGenerator.ts`) that creates stories from the `storybookStories` section in `features.json`.

### Using the Story Generator

#### Basic Usage

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { generateMeta, generateStories } from '@/utils/storybook/storyGenerator';

// Generate meta from features.json
const meta = generateMeta(Button, 'Button') satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate all stories for the component
const stories = generateStories<typeof Button>('Button');

// Export individual stories
export const Primary: Story = stories.primary;
export const Secondary: Story = stories.secondary;
export const WithIcon: Story = stories.withIcon;
```

#### Custom Meta

You can override or extend the generated meta:

```typescript
const meta = generateMeta(Button, 'Button', {
  title: 'Custom/Button/Path',
  parameters: {
    layout: 'fullscreen',
  },
}) satisfies Meta<typeof Button>;
```

### Adding Stories to features.json

Stories are defined in the `storybookStories` section of `features.json`:

```json
{
  "storybookStories": {
    "ComponentName": {
      "storyName": {
        "name": "Display Name",
        "description": "Story description",
        "args": {
          "prop1": "value1",
          "prop2": "value2"
        },
        "parameters": {
          "layout": "centered"
        }
      }
    }
  }
}
```

### Available Utilities

#### `generateMeta<T>(component, componentName, customMeta?)`
Generates Storybook meta configuration from features.json.

#### `generateStory<T>(storyConfig)`
Generates a single story from a story configuration.

#### `generateStories<T>(componentName)`
Generates all stories for a component.

#### `listStorybookComponents()`
Returns an array of all components that have story definitions.

#### `createMockHandlers(handlerNames)`
Creates mock event handlers for stories.

## Component Stories

Stories are organized by component category:

- **Atoms** - Basic UI building blocks (Button, TextField, Typography, Icon, IconButton)
- **Components** - Composed components (DataGrid, ConfirmDialog, FormDialog)
- **Admin** - Admin-specific components

## Best Practices

1. **Use the story generator** - Define stories in features.json and use the generator utility
2. **Keep args simple** - Complex props should have reasonable defaults
3. **Add descriptions** - Help other developers understand the story's purpose
4. **Include multiple states** - Show default, loading, error, empty states
5. **Use mock handlers** - Use `createMockHandlers()` for event handlers

## Testing Stories

Run Storybook tests with:

```bash
npm run storybook:test
```

This uses Vitest to test stories in isolation.

## Component Documentation

Storybook automatically generates documentation from:
- TypeScript prop types
- JSDoc comments
- Story configurations from features.json

Add JSDoc comments to your components:

```typescript
/**
 * Button component for user interactions
 * 
 * @example
 * <Button variant="contained" color="primary" text="Click Me" />
 */
export default function Button({ text, ...props }: ButtonProps) {
  // ...
}
```

## Examples

See these files for examples:
- `src/components/atoms/Button.generated.stories.tsx` - Generated stories example
- `src/components/atoms/Button.stories.tsx` - Manual stories example
- `src/components/admin/DataGrid.stories.tsx` - Complex component stories

## Troubleshooting

### Stories not appearing

1. Check that the component is in `src/**/*.stories.@(js|jsx|ts|tsx)`
2. Verify the story configuration in features.json
3. Check console for errors

### Type errors

Make sure your story definitions match the component's prop types:

```typescript
// features.json
{
  "args": {
    "variant": "contained",  // Must be a valid variant value
    "color": "primary"       // Must be a valid color value
  }
}
```

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
