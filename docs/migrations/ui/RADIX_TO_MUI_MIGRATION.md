# UI Framework Migration Summary

**Date:** December 25, 2025  
**Migration:** Radix UI + Tailwind CSS → Material-UI + SASS

## Changes Made

### 1. Dependencies Updated

#### Removed
- All `@radix-ui/*` packages (28 packages)
- `tailwind-merge`
- `tw-animate-css`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `@heroicons/react`
- `@phosphor-icons/react`
- `next-themes` (replaced with custom MUI theme provider)
- `sonner` (use MUI Snackbar instead)
- `vaul` (use MUI Drawer instead)
- `embla-carousel-react` (use MUI components)
- `react-resizable-panels` (use MUI Grid/Stack)
- `react-day-picker` (use @mui/x-date-pickers)
- `input-otp` (create custom with MUI TextField)

#### Added
- `@mui/material` ^6.3.1
- `@mui/icons-material` ^6.3.1
- `@mui/x-data-grid` ^7.24.2
- `@mui/x-date-pickers` ^7.24.1
- `@emotion/react` ^11.13.5
- `@emotion/styled` ^11.13.5

### 2. New Files Created

1. **`/frontends/nextjs/src/theme/mui-theme.ts`**
   - Light and dark theme configurations
   - Custom color palettes matching project design
   - Typography setup for IBM Plex Sans, Space Grotesk, JetBrains Mono
   - Component style overrides

2. **`/UI_STANDARDS.md`** (project root)
   - Clear policy against Radix UI and Tailwind
   - Quick start guide for MUI
   - Component alternatives table
   - Instructions for AI assistants and developers

3. **`/docs/UI_MIGRATION.md`**
   - Complete component mapping reference
   - Code examples for common patterns
   - Tailwind to MUI sx prop conversion guide
   - SASS module pattern examples
   - Migration checklist

4. **`/frontends/nextjs/src/components/ui/README.md`**
   - Warning about legacy components
   - Quick reference for developers
   - Links to migration resources

### 3. Modified Files

1. **`/frontends/nextjs/package.json`**
   - Updated dependencies (see above)
   - All Radix UI removed from devDependencies
   - Material-UI added to dependencies

2. **`/frontends/nextjs/src/app/providers.tsx`**
   - Replaced `next-themes` ThemeProvider with MUI ThemeProvider
   - Added custom theme context with mode switching
   - Integrated CssBaseline for consistent baseline styles
   - Added useTheme hook for accessing theme state

3. **`/frontends/nextjs/src/app/layout.tsx`**
   - Removed Tailwind className from body
   - Removed sonner Toaster component
   - Simplified layout (fonts still loaded via CDN)

4. **`/.github/copilot-instructions.md`**
   - Added UI Components & Styling section at top of Code Conventions
   - Clear warnings against Radix UI and Tailwind
   - Component mapping examples
   - Updated Styling section to reference MUI theme file

## Installation Instructions

To apply these changes:

```bash
cd frontends/nextjs

# Remove old dependencies and install new ones
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list @mui/material @mui/icons-material
```

## Next Steps for Developers

### Immediate Actions Required

1. **Run npm install** to get the new dependencies
2. **Review migration guide** at `/docs/UI_MIGRATION.md`
3. **Update existing components** that use Radix UI or Tailwind classes

### Migrating Existing Components

When you encounter a component using the old system:

1. Replace Radix UI imports with MUI equivalents
2. Convert Tailwind `className` props to MUI `sx` props or SCSS
3. Use `@mui/icons-material` for icons
4. Test in both light and dark modes

### Example Migration

**Before:**
```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

<div className="flex gap-4 p-6 bg-gray-100">
  <Button className="bg-blue-500 text-white">
    Click me
  </Button>
  <Dialog>
    <DialogContent className="max-w-2xl">
      Content
    </DialogContent>
  </Dialog>
</div>
```

**After:**
```tsx
import { Dialog, DialogContent, Button, Box } from '@mui/material'

<Box sx={{ display: 'flex', gap: 2, p: 3, bgcolor: 'grey.100' }}>
  <Button variant="contained" color="primary">
    Click me
  </Button>
  <Dialog>
    <DialogContent sx={{ maxWidth: 600 }}>
      Content
    </DialogContent>
  </Dialog>
</Box>
```

## Breaking Changes

⚠️ **All existing UI components in `/src/components/ui/` are now legacy** and should not be used.

Components that currently import from these files will break until migrated. The files remain temporarily for reference but should be considered deprecated.

### High-Priority Components to Migrate

Based on grep search, these components have heavy Radix UI usage:
- User Management forms
- Error fallback components
- Dialog-based workflows
- Form inputs and selects
- Navigation menus
- Data tables

## Benefits of This Change

1. **Single UI Library**: Reduced complexity, easier maintenance
2. **Better Theming**: Integrated light/dark mode with MUI theme system
3. **More Features**: Data grids, date pickers, advanced components out of the box
4. **Better Documentation**: MUI has comprehensive docs and examples
5. **Consistency**: One styling approach (SASS + sx prop) instead of multiple
6. **TypeScript**: Better type safety with MUI components
7. **Accessibility**: MUI components follow WCAG guidelines

## Resources

- **UI Standards**: `/UI_STANDARDS.md`
- **Migration Guide**: `/docs/UI_MIGRATION.md`
- **Theme Config**: `/frontends/nextjs/src/theme/mui-theme.ts`
- **MUI Docs**: https://mui.com/material-ui/
- **MUI Icons**: https://mui.com/material-ui/material-icons/

## Support

Questions about migration? Check:
1. `/docs/UI_MIGRATION.md` - Complete examples
2. GitHub Copilot - Updated with new standards
3. MUI documentation - Comprehensive component guides

---

**Status:** ✅ Infrastructure complete. Individual component migration in progress.
