# Fakemui Component Library - Complete Guide

**Last Updated**: 2026-01-23
**Total Components**: 122+ (with intentional duplicates for different use cases)
**Status**: Production Ready with Advanced Features

---

## Component Organization

Fakemui is organized into 10 categories:

| Category | Components | Use Case |
|----------|-----------|----------|
| **Atoms** | 10 | Smallest reusable UI units (Text, Label, Panel) |
| **Inputs** | 28+ | Form inputs and interactive controls |
| **Surfaces** | 7 | Container components (Card, Paper, AppBar) |
| **Layout** | 8 | Spatial arrangement (Box, Grid, Stack) |
| **Data Display** | 18 | Rendering data structures (Table, List, Avatar) |
| **Feedback** | 7 | User feedback (Alert, Progress, Skeleton) |
| **Navigation** | 21 | Navigation patterns (Tabs, Menu, Breadcrumbs) |
| **Utils** | 18 | Utilities and context providers |
| **Lab** (Experimental) | 11 | Cutting-edge components (Timeline, Masonry) |
| **X** (Advanced) | 8+ | Pro/premium features (DataGridPro, advanced pickers) |

---

## Component Duplicates (Intentional)

Some components exist in multiple locations with different APIs for different use cases:

### TreeView (2 Implementations)

**TreeViewFlat** (`data-display/TreeView`)
```typescript
import { TreeViewFlat } from '@/fakemui'

// Array-based API - great for JSON trees
<TreeViewFlat
  data={[
    {
      id: 'node-1',
      label: 'Parent',
      children: [
        { id: 'node-1-1', label: 'Child' }
      ]
    }
  ]}
  onSelect={(nodeId) => console.log(nodeId)}
/>
```

**Use when**: You have tree data from JSON/API and want simple selection handling

---

**TreeViewComponent** (`lab/TreeView` + `lab/TreeItem`)
```typescript
import { TreeView, TreeItem } from '@/fakemui'

// Composition-based API - great for complex layouts
<TreeView>
  <TreeItem nodeId="1" label="Parent">
    <TreeItem nodeId="1-1" label="Child">
      <TreeItem nodeId="1-1-1" label="Grandchild" />
    </TreeItem>
  </TreeItem>
</TreeView>
```

**Use when**: You're building complex hierarchical UI with custom item rendering

---

### DatePicker (2 Implementations)

**DatePicker** (`inputs/DatePicker`)
```typescript
import { DatePicker } from '@/fakemui'

// Simple HTML input-based
<DatePicker
  value="2026-01-23"
  onChange={(val) => console.log(val)}
  format="date"
/>
```

**Use when**: You need a simple date input field in forms

---

**DatePickerAdvanced** (`x/DatePicker`)
```typescript
import { DatePickerAdvanced } from '@/fakemui'

// Advanced with calendar picker UI
<DatePickerAdvanced
  value={new Date()}
  onChange={(date) => console.log(date)}
  views={['year', 'month', 'day']}
/>
```

**Use when**: You want a full calendar UI with advanced date selection

**Also available**: `TimePickerAdvanced`, `DateTimePicker`, `DesktopDatePicker`, `MobileDatePicker`, `CalendarPicker`, `ClockPicker`

---

## Export Map

### From Main Index (`index.ts`)

#### Inputs (28 components)
Button, ButtonGroup, IconButton, Fab, Input, Textarea, Select, NativeSelect, Checkbox, Radio, RadioGroup, Switch, Slider, FormControl, TextField, ToggleButton, ToggleButtonGroup, Autocomplete, Rating, ButtonBase, InputBase, FilledInput, OutlinedInput, FormField, DatePicker, TimePicker, ColorPicker, FileUpload

#### Surfaces (7 components)
Paper, Card, CardHeader, CardContent, CardActions, CardActionArea, CardMedia, Accordion, AccordionSummary, AccordionDetails, AccordionActions, AppBar, Toolbar, Drawer

#### Layout (8 components)
Box, Container, Grid, Stack, Flex, ImageList, ImageListItem, ImageListItemBar

#### Data Display (18+ components)
Typography, Avatar, Badge, Chip, Divider, List, ListItem, ListItemButton, ListItemText, ListItemIcon, ListItemAvatar, ListSubheader, AvatarGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, TablePagination, TableSortLabel, Tooltip, Icon, Markdown, Separator, TreeViewFlat

#### Feedback (7 components)
Alert, Backdrop, CircularProgress, LinearProgress, Skeleton, Snackbar, Spinner

#### Navigation (21 components)
Breadcrumbs, Link, Menu, MenuItem, MenuList, Pagination, PaginationItem, Stepper, Step, StepLabel, StepButton, StepContent, StepConnector, StepIcon, Tabs, Tab, BottomNavigation, BottomNavigationAction, SpeedDial, SpeedDialAction, SpeedDialIcon

#### Utils (18+ components/hooks)
Modal, Dialog, DialogOverlay, DialogPanel, DialogHeader, DialogTitle, DialogContent, DialogActions, Popover, Popper, Portal, ClickAwayListener, CssBaseline, ScopedCssBaseline, GlobalStyles, NoSsr, TextareaAutosize, Fade, Grow, Slide, Zoom, Collapse, useMediaQuery, useMediaQueryUp, useMediaQueryDown, useMediaQueryBetween, ToastProvider, useToast, Iframe, classNames

#### Atoms (10 components)
Text, Title, Label, Panel, Section, StatBadge, States, EditorWrapper, AutoGrid

#### Lab (11 experimental components)
LoadingButton, Masonry, Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent, TreeViewComponent, TreeItem

#### X (8+ advanced components)
DataGrid, DataGridPro, DataGridPremium, DatePickerAdvanced, TimePickerAdvanced, DateTimePicker, DesktopDatePicker, MobileDatePicker, StaticDatePicker, CalendarPicker, ClockPicker

---

## Icons (42 icons)

**Action Icons**: Plus, Trash, Copy, Check, X, Filter, FilterOff
**Navigation Icons**: ArrowUp, ArrowDown, ArrowClockwise, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
**File/UI Icons**: FloppyDisk, Search, Settings, User, UserCheck, Menu (as MenuIcon), Eye, EyeSlash, Pencil
**Communication/Time**: Calendar, Clock, Mail, Bell
**Social**: Star, Heart, Share

---

## Material Design 3 Compliance

All components follow Material Design 3 principles:

- **Color System**: Dynamic theming with custom color palettes
- **Typography**: 6-level hierarchy (Display, Headline, Title, Body, Label)
- **Elevation**: 5 elevation levels (0-5) with consistent shadows
- **Motion**: 3 animation speeds (short: 150ms, standard: 300ms, long: 450ms)
- **Shape**: Rounded corners using CSS custom properties

### Using Design Tokens

```typescript
import { Box, Button } from '@/fakemui'

<Box sx={{
  // MD3 color tokens
  backgroundColor: 'var(--md-sys-color-primary)',
  // MD3 typography
  fontFamily: 'var(--md-sys-typescale-body-large-font-family)',
  fontSize: 'var(--md-sys-typescale-body-large-size)',
  // MD3 shadows
  boxShadow: 'var(--md-sys-shadow-2)',
}}>
  <Button sx={{ color: 'var(--md-sys-color-on-primary)' }}>
    Click me
  </Button>
</Box>
```

---

## Usage Patterns

### Pattern 1: Simple Composition

```typescript
import { Card, CardContent, CardActions, Button, Typography, Stack } from '@/fakemui'

export function MyCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Title</Typography>
        <Typography variant="body2">Description</Typography>
      </CardContent>
      <CardActions>
        <Button>Learn More</Button>
      </CardActions>
    </Card>
  )
}
```

### Pattern 2: Layout with Box & Stack

```typescript
import { Box, Stack, Button, TextField } from '@/fakemui'

export function MyForm() {
  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Stack spacing={2}>
        <TextField label="Name" />
        <TextField label="Email" />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
```

### Pattern 3: Data Display with Table

```typescript
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@/fakemui'

export function MyTable() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
```

### Pattern 4: Dialogs

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@/fakemui'
import { useState } from 'react'

export function MyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
```

### Pattern 5: Notifications with Toast

```typescript
import { ToastProvider, useToast, Button } from '@/fakemui'

function MyComponent() {
  const { showToast } = useToast()

  return (
    <Button onClick={() => showToast({
      message: 'Success!',
      severity: 'success',
      duration: 3000
    })}>
      Show Toast
    </Button>
  )
}

export function App() {
  return (
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  )
}
```

---

## Migration Guide: Custom Styles → Fakemui

### Before (Custom SCSS)

```typescript
// project-canvas.module.scss
.canvas { /* 500+ lines */ }
.toolbar { /* custom flex */ }
.workflowCard { /* custom styling */ }

// page.tsx
import styles from './project-canvas.module.scss'

export function ProjectCanvas() {
  return (
    <div className={styles.canvas}>
      <div className={styles.toolbar}>
        <button>Add</button>
      </div>
    </div>
  )
}
```

### After (Fakemui)

```typescript
import { Box, Stack, Button, Card, CardContent, Toolbar, AppBar } from '@/fakemui'

export function ProjectCanvas() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar>
        <Toolbar>
          <Button startIcon={<Plus />}>Add Workflow</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Workflow cards */}
      </Box>
    </Box>
  )
}
```

**Benefits**:
- 90% less code
- Material Design 3 compliance
- Responsive by default
- Consistent across project

---

## TypeScript Support

All components are fully typed:

```typescript
import type { ButtonProps, CardProps, BoxProps } from '@/fakemui'

interface MyComponentProps extends ButtonProps {
  custom?: string
}

export function MyComponent({ variant, custom, ...rest }: MyComponentProps) {
  return <Button variant={variant} {...rest} />
}
```

---

## Performance Tips

1. **Use Box instead of div** for layout - automatically optimized
2. **Use Stack for spacing** instead of custom margins
3. **Use Flex for flexbox** - shorter syntax
4. **Memoize card content** if rendering many items:
   ```typescript
   const WorkflowCard = React.memo(({ workflow }) => (
     <Card>{/* ... */}</Card>
   ))
   ```
5. **Virtualize tables** with DataGrid for large datasets:
   ```typescript
   <DataGrid rows={10000} columns={cols} {...props} />
   ```

---

## Missing Components (Not Yet Implemented)

- [ ] Breadcrumbs with onClick handlers
- [ ] Autocomplete with async loading
- [ ] Virtual scroller for large lists
- [ ] Date range picker
- [ ] Multi-select dropdown with tags
- [ ] Rich text editor
- [ ] File browser component
- [ ] Notification system with queue

---

## Contributing

When adding new components:

1. Create in appropriate category folder
2. Add JSDoc comments
3. Include TypeScript types
4. Add to category `index.js`
5. Add to main `index.ts`
6. Document in this guide

---

## Support & Resources

- **GitHub**: `/fakemui` directory
- **Storybook**: `npm run storybook` (in fakemui folder)
- **Tests**: `npm test` in fakemui folder
- **Design System**: Material Design 3 docs at m3.material.io
