# Atomic Component Library - Quick Start

## 📚 Documentation Overview

This project now uses an **Atomic Design** component architecture. Here's how to navigate the documentation:

### Essential Reading (Start Here!)

1. **[ATOMIC_REFACTOR_SUMMARY.md](./ATOMIC_REFACTOR_SUMMARY.md)** - Overview of changes
   - What changed and why
   - Component inventory
   - Benefits and usage patterns
   - Next steps

2. **[ATOMIC_COMPONENTS.md](./ATOMIC_COMPONENTS.md)** - Complete guide
   - Atomic design methodology explained
   - Component hierarchy rules
   - When to create each type
   - Best practices and patterns
   - Migration guide

3. **[ATOMIC_USAGE_EXAMPLES.md](./ATOMIC_USAGE_EXAMPLES.md)** - Practical examples
   - 10+ real-world usage examples
   - Code templates
   - Testing patterns
   - Quick start guide

4. **[COMPONENT_MAP.md](./COMPONENT_MAP.md)** - Visual reference
   - Component composition diagrams
   - Dependency maps
   - Data flow examples
   - Performance tips

## 🎯 Quick Reference

### Component Levels

| Level | Purpose | Example | Import From |
|-------|---------|---------|-------------|
| **Atom** | Single UI element | `AppLogo`, `StatusIcon` | `@/components/atoms` |
| **Molecule** | 2-5 atoms combined | `SaveIndicator`, `ToolbarButton` | `@/components/molecules` |
| **Organism** | Complex composition | `AppHeader`, `NavigationMenu` | `@/components/organisms` |
| **Feature** | Domain-specific | `CodeEditor`, `ModelDesigner` | `@/components/[Name]` |

### Directory Structure

```
src/components/
├── atoms/              # 7 building blocks
├── molecules/          # 10 simple combinations
├── organisms/          # 4 complex components
├── ui/                 # shadcn base components
└── [features]/        # Feature components
```

## 🚀 Usage Examples

### Using Atoms
```tsx
import { AppLogo, StatusIcon, ErrorBadge } from '@/components/atoms'

<AppLogo />
<StatusIcon type="saved" animate />
<ErrorBadge count={5} />
```

### Using Molecules
```tsx
import { SaveIndicator, ToolbarButton, EmptyState } from '@/components/molecules'

<SaveIndicator lastSaved={Date.now()} />
<ToolbarButton icon={<Plus />} label="Add" onClick={handleAdd} />
<EmptyState icon={<Code />} title="No files" description="Get started" />
```

### Using Organisms
```tsx
import { AppHeader, PageHeader, NavigationMenu } from '@/components/organisms'

<AppHeader
  activeTab={activeTab}
  onTabChange={setActiveTab}
  lastSaved={lastSaved}
  onExport={handleExport}
  {...props}
/>
```

## 📋 Component Inventory

### Atoms (7)
- `AppLogo` - Application logo
- `TabIcon` - Icon with variants
- `StatusIcon` - Save/sync status
- `ErrorBadge` - Error counter
- `IconWrapper` - Icon container
- `LoadingSpinner` - Loading animation
- `EmptyStateIcon` - Empty state icon

### Molecules (10)
- `SaveIndicator` - Save status display
- `AppBranding` - Logo + title
- `PageHeaderContent` - Page title section
- `ToolbarButton` - Button with tooltip
- `NavigationItem` - Nav link
- `NavigationGroupHeader` - Group header
- `EmptyState` - Empty state view
- `LoadingState` - Loading view
- `StatCard` - Statistics card
- `LabelWithBadge` - Label + badge

### Organisms (4)
- `NavigationMenu` - Sidebar navigation
- `PageHeader` - Page header
- `ToolbarActions` - Action toolbar
- `AppHeader` - Application header

## 🛠️ Creating New Components

### 1. Determine Component Level

Ask yourself:
- Can it be broken down? → Not an atom
- Does it combine atoms? → At least a molecule
- Does it have complex state? → Probably an organism
- Is it feature-specific? → Feature component

### 2. Create the Component

```tsx
// src/components/atoms/MyAtom.tsx
interface MyAtomProps {
  value: string
  variant?: 'default' | 'primary'
}

export function MyAtom({ value, variant = 'default' }: MyAtomProps) {
  return <span className={variant}>{value}</span>
}
```

### 3. Update Index File

```tsx
// src/components/atoms/index.ts
export { MyAtom } from './MyAtom'
```

### 4. Use in Your Code

```tsx
import { MyAtom } from '@/components/atoms'

<MyAtom value="Hello" variant="primary" />
```

## ✅ Best Practices

### DO:
- ✅ Use atoms for single-purpose elements
- ✅ Compose molecules from atoms
- ✅ Build organisms from molecules/atoms
- ✅ Keep feature logic in feature components
- ✅ Export from index files
- ✅ Use TypeScript types
- ✅ Follow naming conventions

### DON'T:
- ❌ Import organisms in atoms
- ❌ Import molecules in atoms
- ❌ Duplicate atom functionality
- ❌ Mix business logic in atoms/molecules
- ❌ Skip TypeScript types
- ❌ Create "god components"

## 📊 Import Hierarchy

```
Feature Components
       ↓ can import
    Organisms
       ↓ can import
    Molecules
       ↓ can import
      Atoms
       ↓ can import
   shadcn UI
```

## 🔧 Common Patterns

### Pattern 1: Status Display
```tsx
const isRecent = Date.now() - lastSaved < 3000
<StatusIcon type={isRecent ? 'saved' : 'synced'} />
```

### Pattern 2: Empty State
```tsx
<EmptyState
  icon={<FileCode size={32} />}
  title="No files yet"
  description="Create your first file"
  action={<Button onClick={onCreate}>Create File</Button>}
/>
```

### Pattern 3: Loading State
```tsx
{isLoading ? (
  <LoadingState message="Loading files..." />
) : (
  <FileList files={files} />
)}
```

### Pattern 4: Stat Cards
```tsx
<div className="grid grid-cols-3 gap-4">
  <StatCard icon={<Code />} label="Files" value={fileCount} />
  <StatCard icon={<Database />} label="Models" value={modelCount} />
  <StatCard icon={<Tree />} label="Components" value={compCount} />
</div>
```

## 🧪 Testing

### Atoms (Unit Tests)
```tsx
describe('StatusIcon', () => {
  it('shows CheckCircle when saved', () => {
    render(<StatusIcon type="saved" />)
    expect(screen.getByTestId('check-circle')).toBeInTheDocument()
  })
})
```

### Molecules (Integration Tests)
```tsx
describe('SaveIndicator', () => {
  it('shows saved text when recent', () => {
    render(<SaveIndicator lastSaved={Date.now() - 1000} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
```

### Organisms (E2E Tests)
```tsx
describe('NavigationMenu', () => {
  it('navigates when item clicked', () => {
    render(<NavigationMenu {...props} />)
    userEvent.click(screen.getByText('Code Editor'))
    expect(onTabChange).toHaveBeenCalledWith('code')
  })
})
```

## 🎨 Styling

All components use:
- **Tailwind** for utility classes
- **CSS variables** for theming
- **Responsive** design patterns
- **Accessible** markup

Example:
```tsx
<div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
  {/* Responsive spacing and text sizing */}
</div>
```

## 📝 TypeScript

All components are fully typed:
```tsx
interface ComponentProps {
  required: string
  optional?: number
  callback?: () => void
  variant?: 'default' | 'primary'
}

export function Component({ required, optional = 0 }: ComponentProps) {
  // Implementation
}
```

## 🚦 Next Steps

1. **Read the docs** - Start with ATOMIC_REFACTOR_SUMMARY.md
2. **Review examples** - Check ATOMIC_USAGE_EXAMPLES.md
3. **Study the maps** - See COMPONENT_MAP.md for visual guides
4. **Try it out** - Create a new molecule or atom
5. **Refactor** - Identify components to atomize

## 💡 Tips

- Start with molecules for most use cases
- Extract atoms when you see duplication
- Build organisms for major UI sections
- Keep feature components for domain logic
- Use index files for clean imports
- Follow the existing patterns

## 🤝 Contributing

When adding new atomic components:

1. Choose the appropriate level
2. Create the component file
3. Add TypeScript types
4. Update the index.ts
5. Add to COMPONENT_MAP.md
6. Create usage examples
7. Write tests

## 📞 Need Help?

1. Check the documentation files
2. Look at existing component examples
3. Review the component map
4. Follow established patterns
5. Ask questions in code reviews

## 🔗 Resources

- **Atomic Design**: https://atomicdesign.bradfrost.com/
- **Component-Driven**: https://www.componentdriven.org/
- **React Patterns**: https://reactpatterns.com/

---

**Remember**: The atomic structure makes components more reusable, testable, and maintainable. When in doubt, start small (atom/molecule) and grow as needed!
