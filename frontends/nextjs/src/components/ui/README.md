# UI Components Directory

## ⚠️ IMPORTANT: This project does NOT use Radix UI or Tailwind CSS

This directory uses **Material-UI (MUI)** exclusively, organized with **Atomic Design** principles.

## Directory Structure

```
ui/
├── atoms/           # Basic building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Checkbox.tsx
│   └── ...
├── molecules/       # Simple component groups
│   ├── Card.tsx
│   ├── Dialog.tsx
│   ├── Select.tsx
│   └── ...
├── organisms/       # Complex UI sections
│   ├── Table.tsx
│   ├── Form.tsx
│   ├── Sidebar.tsx
│   └── ...
└── index.ts         # Main export file
```

## Usage

```tsx
// Import from the main index
import { Button, Card, Table, Dialog } from '@/components/ui'

// Or import from specific category
import { Button, Input } from '@/components/ui/atoms'
import { Card, Select } from '@/components/ui/molecules'
import { Table, Form } from '@/components/ui/organisms'

// Direct MUI imports are also fine
import { Box, Typography, Grid } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
```

## Atomic Design Pattern

### Atoms
Basic UI elements that can't be broken down further:
- Button, Input, Textarea, Label
- Checkbox, Switch, Toggle
- Badge, Avatar, Separator
- Skeleton, Progress, Slider

### Molecules
Simple groups of atoms working together:
- Card, Dialog, Select, Tabs
- Alert, Accordion, Tooltip
- DropdownMenu, RadioGroup, Popover
- ToggleGroup, Breadcrumb

### Organisms
Complex, distinct UI sections:
- Table, Form, Sheet
- Sidebar, Navigation, Command
- Pagination, AlertDialog

## Styling

Use MUI's `sx` prop or SASS modules:

```tsx
// MUI sx prop (recommended)
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>

// SASS module
import styles from './MyComponent.module.scss'
<div className={styles.container}>
```

## Legacy Files

⚠️ **Files in the root of this directory (like `button.tsx`, `dialog.tsx`, etc.) are LEGACY** 
and will be removed. Only use components from:
- `atoms/`
- `molecules/`
- `organisms/`
- Or direct MUI imports

## Documentation

- [UI Standards](../../../../UI_STANDARDS.md) - Project UI policy
- [UI Migration Guide](../../../../docs/UI_MIGRATION.md) - Complete migration reference
- [MUI Theme](../../theme/mui-theme.ts) - Theme configuration
- [Material-UI Docs](https://mui.com/) - Official documentation
