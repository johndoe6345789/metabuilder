# UI Migration Guide: From Radix UI + Tailwind to Material-UI + SASS

## ⚠️ IMPORTANT: Project UI Standards

**This project does NOT use:**
- ❌ Radix UI (removed)
- ❌ Tailwind CSS (removed)
- ❌ inline `className` styling with utility classes

**This project DOES use:**
- ✅ Material-UI (MUI) for all UI components
- ✅ SASS/SCSS for custom styling
- ✅ MUI's theme system for consistent design

## Overview

All UI components have been migrated from Radix UI + Tailwind to Material-UI (MUI) with SASS. This document explains how to work with the new system.

## Quick Reference: Component Mapping

### Radix UI → Material-UI

| Old (Radix UI) | New (Material-UI) |
|----------------|-------------------|
| `<AlertDialog>` | `<Dialog>` with `<DialogTitle>` and `<DialogActions>` |
| `<Accordion>` | `<Accordion>` with `<AccordionSummary>` |
| `<Avatar>` | `<Avatar>` |
| `<Checkbox>` | `<Checkbox>` with `<FormControlLabel>` |
| `<Dialog>` | `<Dialog>` with `<DialogTitle>`, `<DialogContent>` |
| `<DropdownMenu>` | `<Menu>` with `<MenuItem>` |
| `<HoverCard>` | `<Popover>` with hover trigger |
| `<Label>` | `<FormLabel>` or `<InputLabel>` |
| `<Popover>` | `<Popover>` |
| `<Progress>` | `<LinearProgress>` or `<CircularProgress>` |
| `<RadioGroup>` | `<RadioGroup>` with `<FormControlLabel>` |
| `<ScrollArea>` | Native overflow or `<Box>` with `sx` |
| `<Select>` | `<Select>` with `<MenuItem>` |
| `<Separator>` | `<Divider>` |
| `<Sheet>` | `<Drawer>` |
| `<Slider>` | `<Slider>` |
| `<Switch>` | `<Switch>` with `<FormControlLabel>` |
| `<Tabs>` | `<Tabs>` with `<Tab>` |
| `<Toast>` | `<Snackbar>` with `<Alert>` |
| `<Toggle>` | `<ToggleButton>` |
| `<Tooltip>` | `<Tooltip>` |

### Tailwind Classes → MUI/SASS

| Old (Tailwind) | New (MUI/SASS) |
|----------------|----------------|
| `className="flex items-center"` | `sx={{ display: 'flex', alignItems: 'center' }}` |
| `className="grid grid-cols-2 gap-4"` | `sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}` |
| `className="text-lg font-bold"` | `<Typography variant="h6" fontWeight="bold">` |
| `className="bg-primary text-white"` | `sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}` |
| `className="p-4 m-2"` | `sx={{ p: 2, m: 1 }}` (MUI uses 8px spacing units) |
| `className="rounded-lg shadow"` | `<Paper elevation={2} sx={{ borderRadius: 2 }}>` |
| Custom classes | Create `.module.scss` files and import |

## Using Material-UI Components

### Basic Button Example

```tsx
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

// Old (Radix + Tailwind):
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>

// New (MUI):
<Button variant="contained" color="primary" startIcon={<AddIcon />}>
  Click me
</Button>
```

### Dialog Example

```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

// Old (Radix):
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>Title</AlertDialogHeader>
    <AlertDialogDescription>Content</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>OK</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// New (MUI):
<>
  <Button onClick={() => setOpen(true)}>Open</Button>
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>Title</DialogTitle>
    <DialogContent>
      Content
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleOk} variant="contained">OK</Button>
    </DialogActions>
  </Dialog>
</>
```

### Form with Input

```tsx
import { TextField, FormControl, FormLabel } from '@mui/material'

// Old (Radix + Tailwind):
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" className="w-full" />
</div>

// New (MUI):
<TextField
  fullWidth
  label="Email"
  type="email"
  id="email"
  variant="outlined"
/>
```

### Icons

```tsx
import { Add, Delete, Edit, Settings } from '@mui/icons-material'

// Old:
import { Plus, Trash, Edit, Settings } from 'lucide-react'
// or
import { PlusIcon } from '@heroicons/react/24/outline'

// New:
<Add />
<Delete />
<Edit />
<Settings />
```

## Using SASS for Custom Styling

### Module SCSS Files

Create component-specific SCSS files using CSS modules:

```scss
// UserCard.module.scss
.userCard {
  padding: 16px;
  border-radius: 12px;
  background: var(--mui-palette-background-paper);
  
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
  }
}
```

```tsx
// UserCard.tsx
import styles from './UserCard.module.scss'
import { Card } from '@mui/material'

export function UserCard() {
  return (
    <Card className={styles.userCard}>
      <div className={styles.header}>
        {/* content */}
      </div>
    </Card>
  )
}
```

### Using Theme Variables in SASS

Access MUI theme values in SCSS:

```scss
.myComponent {
  // Colors from theme
  color: var(--mui-palette-text-primary);
  background: var(--mui-palette-background-default);
  
  // Spacing (8px base unit)
  padding: var(--mui-spacing-2); // 16px
  margin: var(--mui-spacing-3);  // 24px
  
  // Typography
  font-family: var(--mui-typography-fontFamily);
}
```

## Using MUI's `sx` Prop

The `sx` prop is MUI's shorthand for inline styling with theme access:

```tsx
import { Box, Typography } from '@mui/material'

// Responsive design
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
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

### Spacing System

MUI uses an 8px base spacing unit:

```tsx
sx={{
  p: 1,   // padding: 8px
  p: 2,   // padding: 16px
  p: 3,   // padding: 24px
  pt: 2,  // padding-top: 16px
  px: 3,  // padding-left & padding-right: 24px
  m: 2,   // margin: 16px
  gap: 2, // gap: 16px
}}
```

## Theme Customization

The theme is defined in [mui-theme.ts](../src/theme/mui-theme.ts):

```tsx
import { useTheme } from '@/app/providers'

function MyComponent() {
  const { mode, setMode, toggleTheme } = useTheme()
  
  return (
    <Button onClick={toggleTheme}>
      Current mode: {mode}
    </Button>
  )
}
```

### Accessing Theme in Components

```tsx
import { useTheme } from '@mui/material/styles'

function MyComponent() {
  const theme = useTheme()
  
  return (
    <Box sx={{ 
      color: theme.palette.primary.main,
      [theme.breakpoints.down('md')]: {
        fontSize: '0.875rem',
      },
    }}>
      Content
    </Box>
  )
}
```

## Data Display Components

### Tables

```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper 
} from '@mui/material'

<Paper>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Email</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map(user => (
        <TableRow key={user.id}>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.email}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Paper>
```

For advanced features, use `@mui/x-data-grid`:

```tsx
import { DataGrid } from '@mui/x-data-grid'

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
]

<DataGrid
  rows={users}
  columns={columns}
  pageSize={10}
  checkboxSelection
/>
```

## Common Patterns

### Loading States

```tsx
import { CircularProgress, Box } from '@mui/material'

{isLoading ? (
  <Box display="flex" justifyContent="center" p={3}>
    <CircularProgress />
  </Box>
) : (
  <Content />
)}
```

### Error Display

```tsx
import { Alert, AlertTitle } from '@mui/material'

<Alert severity="error">
  <AlertTitle>Error</AlertTitle>
  {errorMessage}
</Alert>
```

### Cards

```tsx
import { Card, CardHeader, CardContent, CardActions, IconButton } from '@mui/material'
import { MoreVert } from '@mui/icons-material'

<Card>
  <CardHeader
    title="Card Title"
    subheader="Subtitle"
    action={
      <IconButton>
        <MoreVert />
      </IconButton>
    }
  />
  <CardContent>
    Content goes here
  </CardContent>
  <CardActions>
    <Button>Action</Button>
  </CardActions>
</Card>
```

## Migration Checklist

When migrating a component:

- [ ] Remove all Radix UI imports
- [ ] Remove all Tailwind `className` props with utility classes
- [ ] Replace with appropriate MUI components
- [ ] Use `sx` prop for simple inline styles
- [ ] Create `.module.scss` for complex custom styling
- [ ] Update icon imports to `@mui/icons-material`
- [ ] Test responsive behavior
- [ ] Verify theme consistency (light/dark mode)
- [ ] Update tests to work with MUI components

## Resources

- [Material-UI Documentation](https://mui.com/material-ui/getting-started/)
- [MUI System (sx prop)](https://mui.com/system/getting-started/the-sx-prop/)
- [MUI Icons](https://mui.com/material-ui/material-icons/)
- [MUI Theme Customization](https://mui.com/material-ui/customization/theming/)
- [SASS Documentation](https://sass-lang.com/documentation/)

## Need Help?

1. Check [mui-theme.ts](../src/theme/mui-theme.ts) for theme configuration
2. Look at existing migrated components for patterns
3. Use MUI's comprehensive documentation
4. Create `.module.scss` files for complex component-specific styles
