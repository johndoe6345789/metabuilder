# Atoms

Atoms are the smallest, indivisible UI elements in the MetaBuilder component library. Built on Material UI.

## Components

| Component | Description | MUI Base |
|-----------|-------------|----------|
| `Button` | Primary action button with variants | `MuiButton` |
| `Input` | Text input field | `InputBase` |
| `Label` | Form field label | `Typography` |
| `Badge` | Status indicator chip | `Chip` |
| `Checkbox` | Boolean toggle with optional label | `MuiCheckbox` |
| `Switch` | Toggle switch with optional label | `MuiSwitch` |
| `Avatar` | User/entity image with fallback | `MuiAvatar` |
| `Skeleton` | Loading placeholder | `MuiSkeleton` |
| `Separator` | Visual divider | `Divider` |
| `Progress` | Progress indicator | `LinearProgress` |
| `Tooltip` | Hover information | `MuiTooltip` |
| `Spinner` | Loading spinner | `CircularProgress` |
| `IconButton` | Icon-only button | `MuiIconButton` |

## Usage

```typescript
import { Button, Input, Label, Badge } from '@/components/atoms'

function MyComponent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Label>Username</Label>
      <Input placeholder="Enter username" />
      <Badge variant="success" label="Active" />
      <Button variant="contained">Submit</Button>
    </Box>
  )
}
```

## Design Principles

1. ✅ **Single responsibility** - Each atom does one thing well
2. ✅ **MUI-powered** - Built on Material UI for consistency
3. ✅ **Theme-aware** - Respects light/dark mode via `sx` prop
4. ✅ **Accessible** - ARIA attributes and keyboard navigation
5. ✅ **Composable** - Combine to build molecules
6. ❌ **DON'T** import molecules or organisms
7. ❌ **DON'T** add business logic
8. ❌ **DON'T** use Tailwind classes (use MUI `sx` prop instead)

## Styling

All atoms use the MUI `sx` prop for styling, which provides:
- Theme-aware values (colors, spacing, typography)
- Responsive breakpoints
- Dark/light mode support
- Type-safe CSS properties

```tsx
<Button 
  sx={{ 
    mt: 2,              // theme.spacing(2)
    bgcolor: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.dark'
    }
  }}
>
  Styled Button
</Button>
```
