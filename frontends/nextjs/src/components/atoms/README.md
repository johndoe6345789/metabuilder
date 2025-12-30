# Atoms

Atoms are the smallest, indivisible UI elements in the MetaBuilder component library. Built on Material UI.

## Components

### Controls
| Component | Description | MUI Base |
|-----------|-------------|----------|
| `Button` | Primary action button with variants | `MuiButton` |
| `Checkbox` | Boolean toggle with optional label | `MuiCheckbox` |
| `Switch` | Toggle switch with optional label | `MuiSwitch` |
| `Radio` | Radio button with optional label | `MuiRadio` |

### Inputs
| Component | Description | MUI Base |
|-----------|-------------|----------|
| `Input` | Text input field | `InputBase` |
| `TextArea` | Multi-line text input | `TextareaAutosize` |
| `Select` | Dropdown selection | `MuiSelect` |

### Display
| Component | Description | MUI Base |
|-----------|-------------|----------|
| `Label` | Form field label | `Typography` |
| `Badge` | Status indicator chip | `Chip` |
| `Avatar` | User/entity image with fallback | `MuiAvatar` |
| `IconButton` | Icon-only button | `MuiIconButton` |
| `Icon` | Icon wrapper for MUI icons | `@mui/icons-material` |
| `Link` | Navigation link with Next.js integration | `MuiLink` + `NextLink` |
| `Text` | Typography with weight/alignment options | `Typography` |

### Feedback
| Component | Description | MUI Base |
|-----------|-------------|----------|
| `Skeleton` | Loading placeholder | `MuiSkeleton` |
| `Separator` | Visual divider | `Divider` |
| `Progress` | Progress indicator | `LinearProgress` |
| `Tooltip` | Hover information | `MuiTooltip` |
| `Spinner` | Loading spinner | `CircularProgress` |

## Usage

```typescript
import { 
  Button, Input, TextArea, Select, Radio, 
  Label, Badge, Icon, Link, Text 
} from '@/components/atoms'

function MyComponent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Label required>Username</Label>
      <Input placeholder="Enter username" />
      
      <Label>Bio</Label>
      <TextArea placeholder="Tell us about yourself" minRows={4} />
      
      <Label>Country</Label>
      <Select 
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
        placeholder="Select country"
      />
      
      <Radio label="Subscribe to newsletter" />
      
      <Text variant="body2" muted>
        By submitting, you agree to our <Link href="/terms">Terms</Link>
      </Text>
      
      <Button variant="contained" startIcon={<Icon name="Save" />}>
        Save Profile
      </Button>
      
      <Badge variant="success" label="Active" />
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
