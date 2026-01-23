# Fakemui Getting Started Guide

Fakemui is a Material Design 3-compliant UI component library providing 122+ components for consistent design across MetaBuilder frontends (React/Next.js and Qt6/QML).

## Quick Setup

### Installation

Fakemui is available within the MetaBuilder monorepo. Import directly:

```typescript
import { Button, Card, TextField, Box } from '@/fakemui'
```

### Basic Component Usage

```typescript
import { Button, Card, Box, Typography } from '@/fakemui'

export function MyComponent() {
  return (
    <Box sx={{ padding: 2 }}>
      <Card>
        <Typography variant="h6">Hello, Fakemui!</Typography>
        <Button variant="contained" color="primary">
          Click Me
        </Button>
      </Card>
    </Box>
  )
}
```

## Common Components by Category

### Forms & Inputs

```typescript
import {
  Button,
  TextField,
  Select,
  Checkbox,
  RadioButton,
  Switch,
  DatePicker,
  FileUpload
} from '@/fakemui'

// Text input
<TextField label="Enter name" value={value} onChange={handleChange} />

// Select dropdown
<Select options={[{ label: 'Option 1', value: '1' }]} value={selected} />

// Checkbox
<Checkbox label="Agree to terms" checked={isChecked} onChange={handleCheck} />

// Button variations
<Button variant="contained" color="primary">Contained</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="text">Text</Button>
```

### Containers & Layout

```typescript
import { Card, Box, Stack, Grid, AppBar, Drawer } from '@/fakemui'

// Card for content grouping
<Card>
  <Box sx={{ padding: 2 }}>Content here</Box>
</Card>

// Stack for spacing
<Stack spacing={2} direction="row">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>

// Grid for layouts
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>Half width on mobile, full on desktop</Grid>
  <Grid item xs={12} sm={6}>Half width on mobile, full on desktop</Grid>
</Grid>

// Drawer for navigation
<Drawer open={isOpen} onClose={handleClose}>
  <NavigationContent />
</Drawer>
```

### Data Display

```typescript
import { Table, List, Avatar, Badge, Chip, Progress } from '@/fakemui'

// List with items
<List>
  <ListItem>Item 1</ListItem>
  <ListItem>Item 2</ListItem>
</List>

// Table for tabular data
<Table columns={columns} rows={data} />

// Avatar for user images
<Avatar src="/user.jpg" alt="User" size="large" />

// Chip for tags/categories
<Chip label="React" color="primary" onDelete={handleDelete} />

// Progress indicator
<Progress value={65} variant="determinate" />
```

### Feedback & Alerts

```typescript
import { Alert, Dialog, Progress, Skeleton, Tooltip } from '@/fakemui'

// Alert messages
<Alert severity="success">Operation completed!</Alert>
<Alert severity="error">Something went wrong</Alert>

// Dialog/Modal
<Dialog open={isOpen} onClose={handleClose} title="Confirm Action">
  <DialogContent>Are you sure?</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} color="error">Delete</Button>
  </DialogActions>
</Dialog>

// Tooltip
<Tooltip title="Help text">
  <Button>Hover me</Button>
</Tooltip>

// Skeleton loader
<Skeleton variant="text" width={200} height={40} />
```

### Navigation

```typescript
import { Tabs, TabPanel, Menu, Breadcrumbs } from '@/fakemui'

// Tabs
<Tabs value={tab} onChange={setTab}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
</Tabs>
<TabPanel value={tab} index={0}>Tab 1 content</TabPanel>

// Breadcrumbs
<Breadcrumbs>
  <Link href="/">Home</Link>
  <Link href="/docs">Docs</Link>
  <Typography>Current Page</Typography>
</Breadcrumbs>

// Menu/Dropdown
<Menu open={isOpen} onClose={handleClose}>
  <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
  <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
</Menu>
```

## Material Design 3 Theming

### Built-in Themes

Fakemui includes 9 Material Design 3 theme variants:

- **default** - Primary blue theme
- **light** - Light mode
- **dark** - Dark mode
- **ocean** - Ocean blue tones
- **forest** - Green tones
- **sunset** - Orange/warm tones
- **lavender** - Purple tones
- **midnight** - Deep blue tones
- **rose** - Pink/rose tones

### Using Themes

```typescript
import { ThemeProvider } from '@/fakemui/theming'

export function App() {
  return (
    <ThemeProvider theme="dark">
      <MyApp />
    </ThemeProvider>
  )
}
```

### Switching Themes Dynamically

```typescript
import { useTheme } from '@/fakemui/theming'

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <Select
      options={[
        { label: 'Default', value: 'default' },
        { label: 'Dark', value: 'dark' },
        { label: 'Ocean', value: 'ocean' },
      ]}
      onChange={(value) => setTheme(value)}
    />
  )
}
```

## Common Patterns

### Form Handling

```typescript
import { Button, TextField, Box, Alert } from '@/fakemui'
import { useState } from 'react'

export function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setError('Email is required')
      return
    }
    // Submit logic
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  )
}
```

### Data Table with Actions

```typescript
import { Table, IconButton, Menu, MenuItem } from '@/fakemui'
import { useState } from 'react'

export function DataTable({ data }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={(e) => {
            setAnchorEl(e.currentTarget)
            setSelectedRow(params.row.id)
          }}>
            ⋮
          </IconButton>
          <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Delete</MenuItem>
          </Menu>
        </>
      )
    }
  ]

  return <Table columns={columns} rows={data} />
}
```

### Modal Dialog

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@/fakemui'
import { useState } from 'react'

export function ConfirmDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete Item</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          This action cannot be undone. Are you sure?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            // Handle deletion
            setOpen(false)
          }} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
```

## Styling with sx Prop

The `sx` prop provides Material Design 3-aware styling using theme values:

```typescript
<Box sx={{
  // Layout
  display: 'flex',
  flexDirection: 'column',
  gap: 2,

  // Spacing
  padding: 3,
  margin: 2,

  // Colors (theme-aware)
  backgroundColor: 'primary.main',
  color: 'text.primary',

  // Typography
  fontSize: '1.25rem',
  fontWeight: 600,

  // Responsive
  '@media (max-width: 600px)': {
    padding: 1,
    fontSize: '1rem'
  }
}}>
  Responsive content
</Box>
```

## Responsive Design

Fakemui uses Material Design 3 breakpoints:

```typescript
import { useMediaQuery } from '@/fakemui/hooks'

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 600px)')

  return isMobile ? <MobileLayout /> : <DesktopLayout />
}
```

Or use Grid system:

```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Takes full width on mobile, half on tablet, third on desktop
  </Grid>
</Grid>
```

## Best Practices

1. **Use component composition** - Build complex UIs from simple components
2. **Leverage theming** - Use theme colors instead of hardcoding colors
3. **Follow accessibility** - Use semantic HTML and ARIA attributes
4. **Responsive first** - Design for mobile, enhance for larger screens
5. **Avoid sx prop abuse** - Use components and theme values when possible
6. **Type your props** - Use TypeScript for better IDE support
7. **Test interactions** - Use role-based selectors for testing

## Next Steps

- Explore [COMPONENT_API_REFERENCE.md](./COMPONENT_API_REFERENCE.md) for detailed component APIs
- Read [THEMING_GUIDE.md](./THEMING_GUIDE.md) for custom theme creation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and patterns
- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migrating from other UI libraries

## Resources

- [Material Design 3 Spec](https://m3.material.io/)
- Fakemui Component Index: `/fakemui/index.ts`
- React Components: `/fakemui/` directory
- QML Components: `/fakemui/qml/components/` directory
