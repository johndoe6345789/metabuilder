# Atomic Component Usage Examples

This document provides practical examples of using the atomic component library.

## Example 1: Creating a New Feature Header

```tsx
import { PageHeaderContent } from '@/components/molecules'
import { Code } from '@phosphor-icons/react'

export function MyFeatureHeader() {
  return (
    <div className="border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
      <PageHeaderContent
        title="My Feature"
        icon={<Code size={24} weight="duotone" />}
        description="Feature description here"
      />
    </div>
  )
}
```

## Example 2: Creating a Toolbar with Actions

```tsx
import { ToolbarButton } from '@/components/molecules'
import { Plus, Download, Sparkle } from '@phosphor-icons/react'

export function MyToolbar() {
  return (
    <div className="flex gap-2">
      <ToolbarButton
        icon={<Plus size={18} />}
        label="Add Item"
        onClick={() => console.log('Add')}
      />
      <ToolbarButton
        icon={<Download size={18} />}
        label="Export"
        onClick={() => console.log('Export')}
        variant="default"
      />
      <ToolbarButton
        icon={<Sparkle size={18} weight="duotone" />}
        label="AI Generate"
        onClick={() => console.log('AI')}
      />
    </div>
  )
}
```

## Example 3: Empty State with Action

```tsx
import { EmptyState } from '@/components/molecules'
import { Button } from '@/components/ui/button'
import { FileCode } from '@phosphor-icons/react'

export function NoFilesView() {
  return (
    <EmptyState
      icon={<FileCode size={32} />}
      title="No files yet"
      description="Create your first file to get started with your project"
      action={
        <Button onClick={() => console.log('Create')}>
          <Plus size={16} className="mr-2" />
          Create File
        </Button>
      }
    />
  )
}
```

## Example 4: Loading State

```tsx
import { LoadingState } from '@/components/molecules'

export function LoadingFiles() {
  return <LoadingState message="Loading files..." size="lg" />
}
```

## Example 5: Statistics Dashboard

```tsx
import { StatCard } from '@/components/molecules'
import { Code, Database, Tree } from '@phosphor-icons/react'

export function ProjectStats({ fileCount, modelCount, componentCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<Code size={24} />}
        label="Files"
        value={fileCount}
      />
      <StatCard
        icon={<Database size={24} />}
        label="Models"
        value={modelCount}
        variant="primary"
      />
      <StatCard
        icon={<Tree size={24} />}
        label="Components"
        value={componentCount}
      />
    </div>
  )
}
```

## Example 6: Custom Navigation Group

```tsx
import { NavigationItem } from '@/components/molecules'
import { Code, Database, Tree } from '@phosphor-icons/react'

export function MyNavigationSection({ activeTab, onNavigate }) {
  const items = [
    { id: 'code', label: 'Code', icon: <Code size={18} />, value: 'code' },
    { id: 'models', label: 'Models', icon: <Database size={18} />, value: 'models', badge: 5 },
    { id: 'components', label: 'Components', icon: <Tree size={18} />, value: 'components' },
  ]

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavigationItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeTab === item.value}
          badge={item.badge}
          onClick={() => onNavigate(item.value)}
        />
      ))}
    </div>
  )
}
```

## Example 7: Using Atoms Directly

```tsx
import { StatusIcon, ErrorBadge, LoadingSpinner } from '@/components/atoms'

export function StatusIndicators({ isSaved, errorCount, isLoading }) {
  return (
    <div className="flex items-center gap-3">
      {isLoading && <LoadingSpinner size="sm" />}
      {isSaved && <StatusIcon type="saved" animate />}
      {errorCount > 0 && (
        <div className="relative">
          <span>Errors</span>
          <ErrorBadge count={errorCount} />
        </div>
      )}
    </div>
  )
}
```

## Example 8: Building a Custom Molecule

```tsx
// Create: src/components/molecules/FeatureCard.tsx
import { Card } from '@/components/ui/card'
import { IconWrapper } from '@/components/atoms'
import { Button } from '@/components/ui/button'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}

export function FeatureCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: FeatureCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <IconWrapper icon={icon} size="lg" variant="primary" />
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <Button
            size="sm"
            variant={enabled ? 'outline' : 'default'}
            onClick={onToggle}
            className="mt-3"
          >
            {enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

## Example 9: Building a Custom Organism

```tsx
// Create: src/components/organisms/FeatureGrid.tsx
import { FeatureCard } from '@/components/molecules/FeatureCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Feature {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
}

interface FeatureGridProps {
  features: Feature[]
  onToggle: (featureId: string) => void
}

export function FeatureGrid({ features, onToggle }: FeatureGridProps) {
  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            enabled={feature.enabled}
            onToggle={() => onToggle(feature.id)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
```

## Example 10: Responsive Component Pattern

```tsx
import { AppBranding, SaveIndicator } from '@/components/molecules'
import { ToolbarButton } from '@/components/molecules'
import { useIsMobile } from '@/hooks/use-mobile'
import { Menu, Search } from '@phosphor-icons/react'

export function ResponsiveHeader({ lastSaved, onSearch, onMenu }) {
  const isMobile = useIsMobile()

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {isMobile ? (
          <>
            <ToolbarButton
              icon={<Menu size={20} />}
              label="Menu"
              onClick={onMenu}
            />
            <AppBranding title="CodeForge" />
            <ToolbarButton
              icon={<Search size={18} />}
              label="Search"
              onClick={onSearch}
            />
          </>
        ) : (
          <>
            <AppBranding title="CodeForge" subtitle="Low-Code Builder" />
            <SaveIndicator lastSaved={lastSaved} />
            <ToolbarButton
              icon={<Search size={18} />}
              label="Search (Ctrl+K)"
              onClick={onSearch}
            />
          </>
        )}
      </div>
    </header>
  )
}
```

## Best Practices Summary

### ✅ DO:
- Use atoms for single-purpose UI elements
- Compose molecules from atoms
- Build organisms from molecules and atoms
- Keep feature components for complex, domain-specific logic
- Export all components from index files
- Use TypeScript interfaces for all props
- Add descriptive comments to complex compositions

### ❌ DON'T:
- Import organisms in atoms
- Import molecules in atoms
- Duplicate atom functionality
- Mix business logic into atoms or molecules
- Skip TypeScript types
- Create "god components" that do everything

## Migration Checklist

When refactoring an existing component:

1. ☐ Identify reusable parts
2. ☐ Extract atoms (icons, badges, wrappers)
3. ☐ Create molecules (combinations of atoms)
4. ☐ Build organisms (complex compositions)
5. ☐ Update imports in parent components
6. ☐ Add to appropriate index.ts file
7. ☐ Update documentation
8. ☐ Test thoroughly

## Quick Start Template

```tsx
// 1. Create your atom
// src/components/atoms/MyAtom.tsx
export function MyAtom({ value }: { value: string }) {
  return <span>{value}</span>
}

// 2. Update atoms/index.ts
export { MyAtom } from './MyAtom'

// 3. Create your molecule
// src/components/molecules/MyMolecule.tsx
import { MyAtom } from '@/components/atoms'

export function MyMolecule({ label, value }) {
  return (
    <div>
      <MyAtom value={label} />
      <MyAtom value={value} />
    </div>
  )
}

// 4. Update molecules/index.ts
export { MyMolecule } from './MyMolecule'

// 5. Use in your feature
import { MyMolecule } from '@/components/molecules'

export function MyFeature() {
  return <MyMolecule label="Count" value="42" />
}
```

## Component Storybook Template

```tsx
// Create: src/components/atoms/MyAtom.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyAtom } from './MyAtom'

const meta: Meta<typeof MyAtom> = {
  title: 'Atoms/MyAtom',
  component: MyAtom,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MyAtom>

export const Default: Story = {
  args: {
    value: 'Hello World',
  },
}

export const LongText: Story = {
  args: {
    value: 'This is a much longer piece of text to test wrapping',
  },
}
```

## Testing Template

```tsx
// Create: src/components/atoms/__tests__/MyAtom.test.tsx
import { render, screen } from '@testing-library/react'
import { MyAtom } from '../MyAtom'

describe('MyAtom', () => {
  it('renders the value', () => {
    render(<MyAtom value="test" />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('handles empty value', () => {
    render(<MyAtom value="" />)
    expect(screen.queryByText(/./)).not.toBeInTheDocument()
  })
})
```

## TypeScript Patterns

```tsx
// Atom props - simple and focused
interface AtomProps {
  value: string
  variant?: 'default' | 'primary'
  size?: 'sm' | 'md' | 'lg'
}

// Molecule props - combination of atoms
interface MoleculeProps {
  icon: React.ReactNode
  label: string
  value: string | number
  onClick?: () => void
}

// Organism props - complex with callbacks
interface OrganismProps {
  items: Item[]
  activeId: string | null
  onItemSelect: (id: string) => void
  onItemDelete: (id: string) => void
  onItemCreate: () => void
}
```

## Performance Tips

```tsx
// Memoize expensive computations in molecules/organisms
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// Memoize callback functions
const handleClick = useCallback(() => {
  onItemSelect(item.id)
}, [item.id, onItemSelect])

// Use React.memo for expensive renders
export const ExpensiveMolecule = memo(function ExpensiveMolecule(props) {
  // Complex rendering logic
})
```
