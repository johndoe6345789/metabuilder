# MetaBuilder UI Standards

## ⚠️ CRITICAL: Prohibited Dependencies

**DO NOT use these libraries in this project:**

- ❌ **Radix UI** (`@radix-ui/*`) - Removed in favor of Material-UI
- ❌ **Tailwind CSS** - Removed in favor of SASS + MUI styling
- ❌ **Any Radix UI primitives** - Use Material-UI equivalents instead

**DO use:**

- ✅ **Material-UI** (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`)
- ✅ **SASS/SCSS** for custom styling (module pattern preferred)
- ✅ **MUI's `sx` prop** for inline styles with theme access
- ✅ **MUI's theme system** for consistent design tokens

## Why This Change?

1. **Consistency**: Single UI library reduces complexity
2. **Feature-Rich**: MUI provides comprehensive components out of the box
3. **Better Theming**: Integrated theme system with light/dark mode
4. **Data Components**: MUI X components for advanced data tables and pickers
5. **Enterprise-Ready**: Better accessibility and documentation

## Quick Start

### Installing Dependencies

```bash
cd frontends/nextjs
npm install
```

This will install:
- `@mui/material` - Core UI components
- `@mui/icons-material` - Icon library
- `@mui/x-data-grid` - Advanced data tables
- `@emotion/react` & `@emotion/styled` - Required peer dependencies
- `sass` - For custom SCSS styling

### Using MUI Components

```tsx
import { Button, TextField, Dialog } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

function MyComponent() {
  return (
    <Button 
      variant="contained" 
      color="primary"
      startIcon={<AddIcon />}
    >
      Click Me
    </Button>
  )
}
```

### Custom Styling with SASS

```scss
// MyComponent.module.scss
.container {
  padding: 16px;
  background: var(--mui-palette-background-paper);
  
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
```

```tsx
import styles from './MyComponent.module.scss'
import { Card } from '@mui/material'

export function MyComponent() {
  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        {/* content */}
      </div>
    </Card>
  )
}
```

### Using the `sx` Prop

```tsx
import { Box, Typography } from '@mui/material'

<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
  }}
>
  <Typography variant="h6" color="primary.main">
    Title
  </Typography>
</Box>
```

## Documentation

- **[UI Migration Guide](./docs/UI_MIGRATION.md)** - Complete migration reference
- **[MUI Theme Configuration](./frontends/nextjs/src/theme/mui-theme.ts)** - Theme setup
- **[Material-UI Docs](https://mui.com/)** - Official MUI documentation

## For AI Assistants & Code Generators

When working on this codebase:

1. **Never import from `@radix-ui/*`** - Use `@mui/material` instead
2. **Never use Tailwind utility classes** in `className` props - Use MUI's `sx` prop or SCSS modules
3. **Always use MUI components** for UI elements (Button, Dialog, TextField, etc.)
4. **Use `@mui/icons-material`** for icons, not lucide-react or heroicons
5. **Create `.module.scss` files** for component-specific custom styles
6. **Access theme values** via `sx` prop or SASS variables

## Component Alternatives

| ❌ Don't Use | ✅ Use Instead |
|-------------|---------------|
| Radix UI Dialog | MUI Dialog |
| Radix UI Select | MUI Select |
| Radix UI Checkbox | MUI Checkbox |
| Radix UI Switch | MUI Switch |
| Tailwind classes | MUI sx prop or SCSS |
| lucide-react icons | @mui/icons-material |

## Need Help?

See [docs/UI_MIGRATION.md](./docs/UI_MIGRATION.md) for:
- Component mapping reference
- Code examples
- Common patterns
- Migration checklist
