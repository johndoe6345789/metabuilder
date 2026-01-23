# React Hooks Collection

This folder contains all custom React hooks from across the MetaBuilder codebase, consolidated for easy discovery and reuse.

## Hooks by Category

### Authentication
- `useLoginLogic.ts` - Login form logic and state
- `useRegisterLogic.ts` - Registration form logic and state
- `usePasswordValidation.ts` - Password validation rules and feedback
- `useAuthForm.ts` - Generic authentication form handling

### Dashboard & UI
- `useDashboardLogic.ts` - Dashboard state and layout management
- `useResponsiveSidebar.ts` - Responsive sidebar state
- `useHeaderLogic.ts` - Header navigation and state
- `useProjectSidebarLogic.ts` - Project sidebar logic

### Storage & Data
- `useStorageDataHandlers.ts` - Data storage operations
- `useStorageSettingsHandlers.ts` - Settings storage handlers
- `useStorageSwitchHandlers.ts` - Storage mode switching

### Design Tools
- `useFaviconDesigner.ts` - Favicon design functionality
- `useDragResize.ts` - Drag and resize interactions

### Development & Build
- `use-github-build-status.ts` - GitHub build status monitoring

### Utilities
- `I18nNavigation.ts` - Internationalization navigation
- `ToastContext.tsx` - Toast notification context

### Store & Redux
- `hooks.ts` - Redux store hooks
- `index.ts` - Hook exports

## Usage

To use a hook, import it directly:

```typescript
import { useDashboardLogic } from '@/hooks/useDashboardLogic'
```

Or configure your build tool to alias the hooks folder:

```json
{
  "compilerOptions": {
    "paths": {
      "@hooks/*": ["./hooks/*"]
    }
  }
}
```

Then use:

```typescript
import { useLoginLogic } from '@hooks/useLoginLogic'
```

## Adding New Hooks

When creating new hooks, add them here for centralized management:

1. Create the hook in its feature directory
2. Export it from that location
3. Copy it to this folder for centralized discovery

## Source Locations

Hooks are sourced from:
- `workflowui/src/hooks/`
- `codegen/src/hooks/`
- `codegen/src/components/` (component-specific hooks)
- `redux/hooks-*/src/`
- `redux/hooks/src/`
- `pastebin/src/store/`
- `fakemui/react/components/` (component utilities)
