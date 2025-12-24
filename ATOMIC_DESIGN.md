# Atomic Design Structure for MetaBuilder

## Overview
This document describes the atomic design pattern implementation for MetaBuilder's React components. Components are organized into three categories: Atoms, Molecules, and Organisms.

## Principles

### Atoms
**Definition:** Smallest, indivisible UI elements that cannot be broken down further without losing meaning.

**Characteristics:**
- Single responsibility
- No dependencies on other custom components (only shadcn/ui)
- Highly reusable
- Stateless or minimal state
- Examples: buttons, inputs, labels, badges, icons

**Location:** `src/components/atoms/`

### Molecules
**Definition:** Groups of atoms that function together as a cohesive unit.

**Characteristics:**
- Composed of 2-5 atoms
- Single, focused purpose
- Reusable across multiple contexts
- Can have internal state but no complex business logic
- Examples: form fields with labels, search bars, card headers

**Location:** `src/components/molecules/`

### Organisms
**Definition:** Complex components that form distinct sections of an interface.

**Characteristics:**
- Composed of molecules and atoms
- May contain business logic
- Often specific to a particular feature
- Can be entire sections or panels
- Examples: navigation bars, data tables, forms, editors

**Location:** `src/components/organisms/`

## Current Component Organization

### Atoms (`src/components/atoms/`)
Foundational elements that should remain in the atoms folder:
- All shadcn/ui components (`@/components/ui/*`)
- Icon components (from `@phosphor-icons/react`)
- Basic styled elements

### Molecules (`src/components/molecules/`)
Simple composite components:
- `SecurityBadge` - Severity indicator for security warnings
- `UserCard` - Compact user display
- `TenantCard` - Tenant information display
- `TabNavigation` - Tab bar with scroll
- `EmptyState` - Empty state placeholder
- `CredentialsDisplay` - Username/password display with copy
- `PreviewBanner` - Preview mode indicator
- `PropertyField` - Form field with label and input
- `ClassBadge` - CSS class display badge
- `DropdownOption` - Single dropdown option

### Organisms (`src/components/organisms/`)
Complex feature components:
- `SchemaEditor` - Full schema editing interface
- `ComponentCatalog` - Component browsing and selection
- `PropertyInspector` - Component property editor
- `CssClassBuilder` - Visual CSS class selector
- `CssClassManager` - CSS class library management
- `DropdownConfigManager` - Dropdown configuration interface
- `DatabaseManager` - Database management panel
- `UserManagement` - User CRUD interface
- `PackageManager` - Package browsing and installation
- `PackageImportExport` - Import/export functionality
- `LuaEditor` - Lua script editor
- `LuaSnippetLibrary` - Lua snippet management
- `JsonEditor` - JSON editing interface
- `CodeEditor` - Monaco-based code editor
- `NerdModeIDE` - Full IDE panel
- `ThemeEditor` - Theme customization interface
- `SMTPConfigEditor` - SMTP configuration form
- `IRCWebchat` - IRC chat interface
- `IRCWebchatDeclarative` - Declarative IRC chat
- `WorkflowEditor` - Workflow configuration
- `PageRoutesManager` - Page routing management
- `GodCredentialsSettings` - God credentials management
- `ScreenshotAnalyzer` - Screenshot analysis tool
- `GitHubActionsFetcher` - GitHub actions integration
- `AuditLogViewer` - Audit log display

### Pages/Levels (`src/components/`)
Top-level page components (remain at root level):
- `Level1` - Public landing page
- `Level2` - User dashboard
- `Level3` - Admin panel
- `Level4` - God-tier builder
- `Level5` - Super God panel
- `Login` - Authentication
- `UnifiedLogin` - Unified auth interface
- `PasswordChangeDialog` - Password change modal

### Shared Utilities (`src/components/shared/`)
Shared helpers and utilities:
- `constants.ts` - Shared constants
- `types.ts` - Shared type definitions
- `utils.ts` - Shared utility functions

## Migration Guide

### Step 1: Create Folder Structure
```
src/components/
├── atoms/              # Smallest UI elements
├── molecules/          # Simple composite components
├── organisms/          # Complex feature components
├── shared/             # Shared utilities and types
├── ui/                 # shadcn components (existing)
└── [Level components]  # Top-level pages remain at root
```

### Step 2: Move Components
Components should be moved according to their complexity:
1. Start with atoms (if any custom ones exist)
2. Move molecules (2-5 atom combinations)
3. Move organisms (complex features)
4. Update all import paths

### Step 3: Update Imports
Old import:
```typescript
import { ComponentCatalog } from '@/components/ComponentCatalog'
```

New import:
```typescript
import { ComponentCatalog } from '@/components/organisms/ComponentCatalog'
```

### Step 4: Create Index Files
Each folder should have an `index.ts` for easier imports:

```typescript
// src/components/molecules/index.ts
export { SecurityBadge } from './SecurityBadge'
export { UserCard } from './UserCard'
export { TenantCard } from './TenantCard'
// ... etc
```

This allows cleaner imports:
```typescript
import { SecurityBadge, UserCard } from '@/components/molecules'
```

## Benefits

1. **Clarity:** Easy to understand component complexity at a glance
2. **Reusability:** Clear separation encourages reuse of simpler components
3. **Maintainability:** Changes to atoms automatically propagate to molecules and organisms
4. **Testability:** Atoms and molecules are easier to test in isolation
5. **Documentation:** Clear hierarchy serves as living documentation
6. **Onboarding:** New developers can quickly understand the architecture
7. **Refactoring:** Easy to identify when organisms should be broken down

## Best Practices

1. **Atoms should never import molecules or organisms**
2. **Molecules should only import atoms**
3. **Organisms can import atoms, molecules, and other organisms**
4. **Use TypeScript interfaces to define props clearly**
5. **Keep business logic in organisms, not atoms/molecules**
6. **Make atoms and molecules as generic as possible**
7. **Use composition over inheritance**
8. **Document complex organisms with JSDoc comments**

## File Naming Conventions

- Use PascalCase for component files: `SecurityBadge.tsx`
- Use kebab-case for style files: `security-badge.module.css`
- Use camelCase for utility files: `formatUtils.ts`
- Index files should re-export components: `index.ts`

## Component Template

```typescript
// src/components/atoms/ExampleAtom.tsx
import { cn } from '@/lib/utils'

interface ExampleAtomProps {
  label: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function ExampleAtom({ 
  label, 
  variant = 'primary', 
  className 
}: ExampleAtomProps) {
  return (
    <div className={cn('base-styles', className)}>
      {label}
    </div>
  )
}
```

## Migration Checklist

- [ ] Create folder structure (atoms, molecules, organisms, shared)
- [ ] Identify and categorize all existing components
- [ ] Create index files for each folder
- [ ] Move atoms to their folder
- [ ] Move molecules to their folder
- [ ] Move organisms to their folder
- [ ] Update all import statements
- [ ] Update tests to use new paths
- [ ] Verify application builds successfully
- [ ] Verify all functionality works
- [ ] Update documentation

## References

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Component Patterns](https://reactpatterns.com/)
- [Component-Driven Development](https://www.componentdriven.org/)
