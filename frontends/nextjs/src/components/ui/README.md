# UI Components Directory

## ⚠️ IMPORTANT: This project no longer uses Radix UI or Tailwind CSS

This directory previously contained shadcn/ui components built with Radix UI primitives and Tailwind CSS. **These have been removed.**

## Current UI System

**Use Material-UI (MUI) instead:**

```tsx
// ❌ Old (Don't use)
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// ✅ New (Use this)
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
```

## Migration Guide

See [/docs/UI_MIGRATION.md](../../../../docs/UI_MIGRATION.md) for:
- Complete component mapping (Radix → MUI)
- How to convert Tailwind classes to MUI's `sx` prop
- Using SASS for custom styling
- Theme configuration
- Code examples

## Quick Reference

| Old Component | New Component |
|--------------|---------------|
| `<Button>` from ui/button | `<Button>` from @mui/material |
| `<Dialog>` from ui/dialog | `<Dialog>` from @mui/material |
| `<Select>` from ui/select | `<Select>` from @mui/material |
| `<Checkbox>` from ui/checkbox | `<Checkbox>` from @mui/material |
| `<Switch>` from ui/switch | `<Switch>` from @mui/material |
| `className="..."` with Tailwind | `sx={{ ... }}` with MUI styling |

## Legacy Files

Files in this directory are **legacy** and should not be used. They will be removed in a future cleanup. 

**Do not import from this directory.** All UI components should come from `@mui/material`.

## Documentation

- [UI Standards](../../../../UI_STANDARDS.md) - Project UI policy
- [UI Migration Guide](../../../../docs/UI_MIGRATION.md) - Complete migration reference
- [MUI Theme](../../theme/mui-theme.ts) - Theme configuration
- [Material-UI Docs](https://mui.com/) - Official documentation
