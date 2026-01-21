# Atomic Component Library

This codebase follows the **Atomic Design** methodology to organize UI components into a scalable, maintainable structure.

## Structure Overview

```
src/components/
├── atoms/           # Basic building blocks (smallest components)
├── molecules/       # Simple combinations of atoms
├── organisms/       # Complex components built from molecules and atoms
├── ui/             # shadcn base components
└── [features]/     # Feature-specific complex components
```

## Hierarchy Explained

### 🧪 Atoms (`/atoms`)
**Purpose**: The smallest, most fundamental UI elements that cannot be broken down further.

**Characteristics**:
- Single-purpose components
- No business logic
- Highly reusable
- Accept minimal props
- No dependencies on other custom components (may use shadcn)

**Examples**:
- `AppLogo` - The application logo icon
- `TabIcon` - Icon wrapper with styling variants
- `StatusIcon` - Status indicator icons (saved, synced)
- `ErrorBadge` - Badge showing error count

**When to create an atom**:
- You have a single UI element used in multiple places
- The component has no complex logic or state
- It's a styled wrapper around a basic HTML element or icon

---

### 🔬 Molecules (`/molecules`)
**Purpose**: Simple combinations of atoms that work together as a unit.

**Characteristics**:
- Composed of 2-5 atoms
- Single responsibility
- Minimal state management
- Reusable across multiple contexts
- May include simple interactions

**Examples**:
- `SaveIndicator` - Combines StatusIcon + text to show save status
- `AppBranding` - Combines AppLogo + title + subtitle
- `PageHeaderContent` - Combines TabIcon + title + description
- `ToolbarButton` - Button + Tooltip wrapper
- `NavigationItem` - Icon + label + badge navigation button
- `NavigationGroupHeader` - Collapsible group header with count

**When to create a molecule**:
- You're combining atoms to create a meaningful UI pattern
- The combination is reused in multiple organisms
- It represents a single functional unit (like "branding" or "save status")

---

### 🧬 Organisms (`/organisms`)
**Purpose**: Complex, feature-rich components that combine molecules and atoms.

**Characteristics**:
- Complex composition (5+ child components)
- May manage state
- Business logic allowed
- Feature-specific functionality
- Can include API calls or data fetching

**Examples**:
- `NavigationMenu` - Full sidebar navigation with groups, items, search
- `PageHeader` - Complete page header with icon and description
- `ToolbarActions` - Toolbar with multiple action buttons
- `AppHeader` - Complete application header with nav, branding, save indicator, and actions

**When to create an organism**:
- You're building a major UI section (header, navigation, toolbar)
- The component manages complex state or user interactions
- It coordinates multiple molecules and atoms
- It's feature-specific rather than generic

---

### 🏗️ Feature Components (`/components/[FeatureName].tsx`)
**Purpose**: Full-featured, domain-specific components that implement complete features.

**Characteristics**:
- High-level business components
- Complete feature implementations
- May use multiple organisms, molecules, and atoms
- Include complex state management
- Feature-specific (not reusable across features)

**Examples**:
- `CodeEditor` - Full Monaco code editor with file management
- `ModelDesigner` - Complete Prisma model design interface
- `ComponentTreeBuilder` - React component hierarchy builder
- `WorkflowDesigner` - Visual workflow design canvas
- `ProjectDashboard` - Complete dashboard view

**When to create a feature component**:
- You're implementing a complete feature or page
- The component is not reusable outside its feature domain
- It requires significant state management and business logic

---

## Component Organization Rules

### 1. Import Hierarchy
Components should only import from their level or below:
- ✅ Organisms can import molecules and atoms
- ✅ Molecules can import atoms
- ❌ Atoms should NOT import molecules or organisms
- ❌ Molecules should NOT import organisms

### 2. Naming Conventions
- **Atoms**: Simple nouns (`AppLogo`, `StatusIcon`, `ErrorBadge`)
- **Molecules**: Descriptive combinations (`SaveIndicator`, `ToolbarButton`, `NavigationItem`)
- **Organisms**: Feature-descriptive (`NavigationMenu`, `AppHeader`, `ToolbarActions`)
- **Features**: Feature names (`CodeEditor`, `ModelDesigner`, `ProjectDashboard`)

### 3. File Structure
Each atomic level has:
```
atoms/
├── AppLogo.tsx
├── TabIcon.tsx
├── StatusIcon.tsx
├── ErrorBadge.tsx
└── index.ts    # Exports all atoms
```

### 4. Index Files
Each directory should have an `index.ts` for clean imports:
```typescript
// atoms/index.ts
export { AppLogo } from './AppLogo'
export { TabIcon } from './TabIcon'
export { StatusIcon } from './StatusIcon'
export { ErrorBadge } from './ErrorBadge'
```

This allows:
```typescript
// Good ✅
import { AppLogo, StatusIcon } from '@/components/atoms'

// Instead of ❌
import { AppLogo } from '@/components/atoms/AppLogo'
import { StatusIcon } from '@/components/atoms/StatusIcon'
```

---

## Configuration Files

### `lib/navigation-config.tsx`
Centralized configuration for navigation structure:
- **`tabInfo`**: Maps tab IDs to their display information
- **`navigationGroups`**: Defines navigation hierarchy and groupings
- **`NavigationItemData`**: TypeScript interfaces for type safety

**Benefits**:
- Single source of truth for navigation
- Easy to add/remove navigation items
- Type-safe navigation configuration
- Separates data from presentation logic

---

## Migration Guide

When refactoring existing components:

1. **Identify the component's level**
   - Does it contain business logic? → Feature component
   - Does it combine many elements? → Organism
   - Does it combine a few atoms? → Molecule
   - Is it a single UI element? → Atom

2. **Check dependencies**
   - What does it import?
   - Can it be broken into smaller pieces?
   - Are parts reusable elsewhere?

3. **Extract reusable parts**
   ```typescript
   // Before: Monolithic component
   function Header() {
     return (
       <header>
         <div className="logo">...</div>
         <div className="save">...</div>
         <div className="actions">...</div>
       </header>
     )
   }

   // After: Atomic structure
   // atoms/AppLogo.tsx
   export function AppLogo() { ... }

   // molecules/SaveIndicator.tsx
   export function SaveIndicator() { ... }

   // organisms/AppHeader.tsx
   export function AppHeader() {
     return (
       <header>
         <AppLogo />
         <SaveIndicator />
         <ToolbarActions />
       </header>
     )
   }
   ```

4. **Move to appropriate directory**
   - Create the component file in its level directory
   - Update the level's `index.ts`
   - Update imports in consuming components

---

## Best Practices

### 1. Keep Atoms Pure
```typescript
// Good ✅ - Pure, reusable atom
export function StatusIcon({ type, size = 14 }: StatusIconProps) {
  return type === 'saved' 
    ? <CheckCircle size={size} className="text-accent" />
    : <CloudCheck size={size} />
}

// Bad ❌ - Too much logic for an atom
export function StatusIcon({ lastSaved }: { lastSaved: number }) {
  const [time, setTime] = useState(Date.now())
  useEffect(() => { /* complex logic */ }, [lastSaved])
  return <CheckCircle />
}
```

### 2. Compose in Molecules
```typescript
// Good ✅ - Molecule combines atoms with simple logic
export function SaveIndicator({ lastSaved }: SaveIndicatorProps) {
  const isRecent = Date.now() - lastSaved < 3000
  return (
    <div>
      <StatusIcon type={isRecent ? 'saved' : 'synced'} />
      <span>{isRecent ? 'Saved' : timeAgo}</span>
    </div>
  )
}
```

### 3. Coordinate in Organisms
```typescript
// Good ✅ - Organism manages complex state and coordinates molecules
export function AppHeader({ onSave, onSearch }: AppHeaderProps) {
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  
  return (
    <header>
      <AppBranding />
      <SaveIndicator lastSaved={lastSaved} />
      <ToolbarActions onSave={onSave} onSearch={onSearch} />
    </header>
  )
}
```

### 4. Single Responsibility
Each component should do one thing well:
- `AppLogo` → Show the logo
- `SaveIndicator` → Show save status
- `AppHeader` → Compose the complete header

### 5. Props Over Children (Usually)
Prefer explicit props for better type safety:
```typescript
// Good ✅
<ToolbarButton icon={<Search />} label="Search" onClick={onSearch} />

// Less ideal (but sometimes necessary)
<ToolbarButton onClick={onSearch}>
  <Search />
  Search
</ToolbarButton>
```

---

## Benefits of Atomic Design

1. **Reusability**: Atoms and molecules can be used across features
2. **Consistency**: Shared atoms ensure consistent UI
3. **Testability**: Small components are easier to test
4. **Maintainability**: Changes propagate naturally through composition
5. **Collaboration**: Clear boundaries make teamwork easier
6. **Documentation**: Structure itself documents component relationships
7. **Performance**: Smaller components are easier to optimize
8. **Refactoring**: Easy to identify and extract reusable patterns

---

## Quick Reference

| Level | Size | State | Logic | Reusability | Examples |
|-------|------|-------|-------|-------------|----------|
| **Atom** | 1 element | None | None | Very High | Logo, Icon, Badge |
| **Molecule** | 2-5 atoms | Minimal | Simple | High | SaveIndicator, ToolbarButton |
| **Organism** | 5+ components | Moderate | Complex | Medium | Navigation, Header, Toolbar |
| **Feature** | Full feature | Complex | Business | Low | CodeEditor, Dashboard |

---

## Future Improvements

Potential enhancements to the atomic structure:

1. **Storybook Integration**: Document all atoms and molecules in Storybook
2. **Visual Regression Testing**: Test component appearance automatically
3. **Component Playground**: Interactive component explorer
4. **Design Tokens**: Move colors/spacing to design token system
5. **Component Generator**: CLI tool to scaffold new components
6. **Dependency Graphs**: Visualize component relationships

---

## Getting Help

When deciding where a component belongs, ask:

1. **Can it be broken down?** → If yes, it's not an atom
2. **Does it combine atoms?** → It's at least a molecule
3. **Does it have complex state?** → Probably an organism
4. **Is it feature-specific?** → Keep it as a feature component

**Still unsure?** Start with a higher level (organism or feature) and refactor down as patterns emerge.
